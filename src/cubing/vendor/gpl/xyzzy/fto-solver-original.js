/* ftosolver.js - An FTO solver
version 0.5.1 (2021-04-20)

Copyright (c) 2016, 2020, 2021

From https://gist.github.com/torchlight/efa6a52e4f424d796f5dccdb671e7be6
Originally MIT licensed, added to `cubing.js` under the GPL license by permission from the author (@torchlight/xyzzy).

Compatibility note:
This is targeted at Firefox / Spidermonkey releases from 2019 and onwards. It might not run on older
JavaScript engines. Recent Chrome / Node releases should also work, but are not tested as much.
*/

"use strict";

/* Helper functions */

function counter(A) {
  let counts = [];
  for (let a of A) {
    counts[a] = (counts[a] || 0) + 1;
  }
  return counts;
}

let rng = (() => {
  let entropy = 0;
  let entropy_size = 1;
  // invariant: 1 <= entropy_size <= 2**53 and 0 <= entropy < entropy_size

  let random_bit = this.crypto
    ? () => crypto.getRandomValues(new Uint8Array(1))[0] & 1
    : () => Math.round(Math.random());

  const SAFETY_MARGIN = 10000;
  const MAX_ITERATIONS = 20;
  /*
The probability of using a fallback nonuniform RNG is bounded by 1 / SAFETY_MARGIN ** MAX_ITERATIONS
assuming the underlying RNG used is free from bias. With these values, this means that there is at
most a 1/10^80 chance of using the fallback, which is basically zero.

Note: SAFETY_MARGIN must be at most 2**20.
*/

  function next(bound) {
    if (bound <= 0 || bound > 2 ** 32 || bound !== Math.floor(bound)) {
      throw new Error("invalid bound");
    }
    for (let it = 0; it <= MAX_ITERATIONS; it++) {
      for (
        let i = 0;
        i < 53 &&
        entropy_size <= 2 ** 52 &&
        entropy_size < bound * SAFETY_MARGIN;
        i++
      ) {
        entropy += random_bit() * entropy_size;
        entropy_size *= 2;
      }
      let limit = entropy_size - (entropy_size % bound); // = floor(entropy_size / bound) * bound
      if (entropy < limit || it === MAX_ITERATIONS) {
        let result = entropy % bound;
        entropy = (entropy - result) / bound;
        entropy_size = limit / bound;
        if (entropy === entropy_size) {
          // this can happen only if we've exceeded the iteration limit
          entropy = 0;
          entropy_size = 1;
        }
        return result;
      }
      entropy -= limit;
      entropy_size -= limit;
    }
  }

  return { next, is_crypto: !!this.crypto };
})();

/* Combinatoric functions */

function factorial(n) {
  if (n < 2) {
    return n;
  }
  let f = 1;
  for (let i = 2; i <= n; i++) {
    f *= i;
  }
  return f;
}

function C(n, k) {
  if (k < 0 || k > n) {
    return 0;
  }
  if (k === 0 || k === n) {
    return 1;
  }
  let c = 1;
  for (let i = 0; i < k; i++) {
    c = ((c * (n - i)) / (i + 1)) | 0;
  }
  return c;
}

function C4(n, k0, k1, k2, k3 = n - k0 - k1 - k2) {
  return C(n, k0 + k1) * C(k0 + k1, k0) * C(k2 + k3, k2);
}

function permutation_to_index(perm) {
  perm = perm.slice();
  let n = perm.length;
  let f = factorial(n - 1);
  let ind = 0;
  while (n > 1) {
    n--;
    // invariant: f === factorial(n)
    // also, perm stores meaningful values up to perm[n]
    let e = perm[0];
    ind += e * f;
    for (let i = 0; i < n; i++) {
      let x = perm[i + 1];
      perm[i] = x - (x > e);
    }
    f /= n;
  }
  return ind;
}

function index_to_permutation(ind, n) {
  let perm = [];
  let f = factorial(n - 1);
  for (let i = 0; i < n; i++) {
    perm[i] = (ind / f) | 0;
    ind %= f;
    f /= n - 1 - i;
  }
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      perm[j] += +(perm[j] >= perm[i]);
    }
  }
  return perm;
}

function permutation_parity(A) {
  let n = A.length;
  let parity = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i; j < n; j++) {
      if (A[i] > A[j]) {
        parity ^= 1;
      }
    }
  }
  return parity;
}

function index_to_evenpermutation(ind, n) {
  let perm = [];
  let f = factorial(n - 1) / 2;
  let parity = 0;
  for (let i = 0; i < n - 1; i++) {
    perm[i] = (ind / f) | 0;
    ind %= f;
    f /= n - 1 - i;
  }
  perm[n - 1] = 0;
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (perm[j] >= perm[i]) {
        perm[j]++;
      } else {
        parity ^= 1;
      }
    }
  }
  if (parity === 1) {
    [perm[n - 2], perm[n - 1]] = [perm[n - 1], perm[n - 2]];
  }
  return perm;
}

function evenpermutation_to_index(perm) {
  return permutation_to_index(perm) >> 1;
}

let [evenpermutation8_to_index, index_to_evenpermutation8] = (() => {
  let index_in_set_bits = new Int8Array(256 * 8);
  let look_up_set_bits = new Int8Array(256 * 8);
  for (let i = 0; i < 256; i++) {
    for (let j = 0, counter = 0; j < 8; j++) {
      if (((i >>> j) & 1) === 0) {
        continue;
      }
      index_in_set_bits[(j << 8) | i] = counter;
      look_up_set_bits[(counter << 8) | i] = j;
      counter++;
    }
  }

  function evenpermutation8_to_index(perm) {
    let unused = 0xff; // track which values in 0..7 haven't been used so far
    let f = 2520; // = 7!/2
    let ind = 0;
    for (let i = 0; i < 6; i++) {
      let v = perm[i];
      ind += index_in_set_bits[unused | (v << 8)] * f;
      unused &= ~(1 << v);
      f /= 7 - i;
    }
    return ind;
  }

  // note: this is *not* a drop-in replacement for index_to_evenpermutation!
  function index_to_evenpermutation8(ind, perm) {
    let unused = 0xff;
    let f = 2520; // = 7!/2
    let parity = 0;
    for (let i = 0; i < 6; i++) {
      let a = (ind / f) | 0;
      ind -= a * f;
      parity ^= a & 1;
      let v = look_up_set_bits[unused | (a << 8)];
      perm[i] = v;
      unused &= ~(1 << v);
      f /= 7 - i;
    }
    // the last two elements are uniquely determined by the others
    perm[6] = look_up_set_bits[unused | (parity << 8)];
    perm[7] = look_up_set_bits[unused | ((parity ^ 1) << 8)];
    return perm;
  }

  return [evenpermutation8_to_index, index_to_evenpermutation8];
})();

function random_permutation(n) {
  let p = [0];
  for (let i = 1; i < n; i++) {
    let r = rng.next(i + 1);
    p[i] = p[r];
    p[r] = i;
  }
  return p;
}

function random_even_permutation(n) {
  let p = random_permutation(n);
  if (permutation_parity(p) === 1) {
    [p[0], p[1]] = [p[1], p[0]];
  }
  return p;
}

function comb_to_index(l) {
  let bits = l.length;
  let ones = 0;
  for (let i = 0; i < bits; i++) {
    ones += +(l[i] === 1);
  }
  let zeros = bits - ones;
  if (zeros === 0 || ones === 0 || bits === 1) {
    return 0;
  }
  let b = C(bits - 1, ones);
  let ind = 0;
  for (let i = 0; zeros > 0 && ones > 0 && bits > 1; i++) {
    bits--;
    if (l[i] === 0) {
      b = (b * --zeros) / bits;
    } else {
      // l[i] === 1
      ind += b;
      b = (b * ones--) / bits;
    }
  }
  return ind;
}

function index_to_comb(ind, ones, bits) {
  let zeros = bits - ones;
  let b = C(bits - 1, ones);
  let l = [];
  let n = bits - 1;
  for (let i = 0; i < n; i++) {
    bits--;
    if (ind < b) {
      l.push(0);
      b = (b * --zeros) / bits;
    } else {
      l.push(1);
      ind -= b;
      b = (b * ones--) / bits;
    }
  }
  l.push(ones);
  return l;
}

// this is "incorrect" for n=0 but that's out of scope
function ctz(n) {
  n |= 0;
  return 31 - Math.clz32(n ^ (n - 1));
}

let comb_lookup_tables = {};
function generate_comb_lookup_tables(n, k) {
  // 2 <= n <= 28, 0 <= k <= n
  n |= 0;
  k |= 0;
  let key = `${n} ${k}`;
  if (comb_lookup_tables[key]) {
    return comb_lookup_tables[key];
  }
  let total = C(n, k);
  let index_to_comb_table = new Uint32Array(total);
  let comb_to_index_table = new Uint32Array(1 << n).fill(-1);
  for (let i = 0, c = (1 << k) - 1; i < total; i++) {
    index_to_comb_table[i] = c;
    comb_to_index_table[c] = i;
    let t = c | (c - 1);
    c = (t + 1) | (((~t & -~t) - 1) >> (ctz(c) + 1));
  }
  return (comb_lookup_tables[key] = [index_to_comb_table, comb_to_index_table]);
}

function popcount(n) {
  n |= 0;
  let c = 0;
  while (n !== 0) {
    n &= n - 1;
    c++;
  }
  return c;
}

function spread_bits(n) {
  n &= 0xffff;
  n = (n | (n << 8)) & 0x00ff00ff;
  n = (n | (n << 4)) & 0x0f0f0f0f;
  n = (n | (n << 2)) & 0x33333333;
  n = (n | (n << 1)) & 0x55555555;
  return n;
}

function interleave_bits(x, y) {
  return spread_bits(x) | (spread_bits(y) << 1);
}

let comb4_lookup_tables = {};
function generate_comb4_lookup_tables(n, k0, k1, k2, k3) {
  // 3 <= n <= 14
  // 0 <= k0,k1,k2,k3 <= n
  // n = k0 + k1 + k2 + k3
  // WARNING: This does not return the combinations in sorted order.
  // (but if only two of k0,k1,k2,k3 are nonzero, then they will be sorted)
  n |= 0;
  k0 |= 0;
  k1 |= 0;
  k2 |= 0;
  k3 |= 0;
  if (n !== k0 + k1 + k2 + k3) {
    throw new Error("generate_comb4_lookup_tables: invalid parameters");
  }
  let key = [n, k0, k1, k2, k3].join(" ");
  if (comb4_lookup_tables[key]) {
    return comb4_lookup_tables[key];
  }
  let [itcl, ctil] = generate_comb_lookup_tables(n, k1 + k3);
  let [itch, ctih] = generate_comb_lookup_tables(n, k2 + k3);
  let total = C4(n, k0, k1, k2, k3);
  let index_to_comb4_table = new Uint32Array(total);
  let comb4_to_index_table = new Uint32Array(4 ** n).fill(-1);
  for (let i = 0, index = 0; i < itch.length; i++) {
    let ch = itch[i];
    for (let j = 0; j < itcl.length; j++) {
      let cl = itcl[j];
      if (popcount(cl & ch) === k3) {
        let c = interleave_bits(cl, ch);
        index_to_comb4_table[index] = c;
        comb4_to_index_table[c] = index;
        index++;
      }
    }
  }
  return (comb4_lookup_tables[key] = [
    index_to_comb4_table,
    comb4_to_index_table,
  ]);
}

function compose(A, B) {
  let C = [];
  for (let i = 0; i < B.length; i++) {
    C[i] = A[B[i]];
  }
  return C;
}

function compose3(A, B, C) {
  let D = [];
  for (let i = 0; i < C.length; i++) {
    D[i] = A[B[C[i]]];
  }
  return D;
}

function compose_o(A, B) {
  let p = compose(A[0], B[0]);
  let o = [];
  let n = B[0].length;
  for (let i = 0; i < n; i++) {
    o[i] = A[1][B[0][i]] ^ B[1][i];
  }
  return [p, o];
}

/*
function permutation_from_cycle(cycle, n)
{
	let perm = [];
	for (let i = 0; i < n; i++) {perm[i] = i};
	for (let i = 0; i < cycle.length; i++)
	{
		perm[cycle[i]] = cycle[(i + 1) % cycle.length];
	}
	return perm;
}
*/

function permutation_from_cycles(cycles, n) {
  let perm = [];
  for (let i = 0; i < n; i++) {
    perm[i] = i;
  }
  for (let cycle of cycles) {
    for (let i = 0; i < cycle.length; i++) {
      perm[cycle[i]] = cycle[(i + 1) % cycle.length];
    }
  }
  return perm;
}

function reduce_permutation(perm, keep) {
  // perm: a permutation
  // keep: array of booleans, of the same length as perm
  let n = perm.length;
  let count = Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    count[i] = count[i - 1] + keep[i - 1];
  }
  let nn = count[n - 1] + keep[n - 1];
  let reduced = Array(nn);
  for (let i = 0; i < n; i++) {
    if (keep[i]) {
      reduced[count[i]] = count[perm[i]];
    }
  }
  return reduced;
}

function invert_permutation(perm) {
  let n = perm.length;
  let inverse = Array(n);
  for (let i = 0; i < n; i++) {
    inverse[perm[i]] = i;
  }
  return inverse;
}

function gcd(a, b) {
  while (a && b) {
    [a, b] = [b % a, a];
  }
  return Math.abs(a + b);
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function permutation_order(perm) {
  let order = 1;
  let n = perm.length;
  let visited = Array(n).fill(false);
  let i = -1;
  while (true) {
    i = visited.indexOf(false, i + 1);
    if (i === -1) {
      break;
    }
    let cycle_length = 0;
    let j = i;
    while (!visited[j]) {
      visited[j] = true;
      j = perm[j];
      cycle_length++;
    }
    //console.log(cycle_length);
    order = lcm(order, cycle_length);
  }
  return order;
}

/*
Facelet layout:
				U									B
		8	7	6	5	4					67	68	69	70	71
	44		3	2	1		49			22		64	65	66		35
	43	39		0		46	50			23	19		63		30	34
L	42	38	36		45	47	51	R	BR	24	20	18		27	29	33	BL
	41	37		9		48	52			25	21		54		28	32
	40		10	11	12		53			26		57	56	55		31
		13	14	15	16	17					62	61	60	59	58
				F									D

We'll be using the facelet permutations as the underlying representation. This specific labelling
gives us three symmetries that can be written very compactly, and this turns out to be enough to
generate any face move from any other face move.

Which is nice, because I don't have an FTO and it would be very error prone if I were to write out
every move individually.

X = T2
Y = Ro Lo' (I think)
Z = mirroring so that U swaps with L and F swaps with R

Faces / colours (Lanlan colour scheme):
0: U (white)
1: F (red)
2: BR (grey)
3: BL (orange)
4: L (purple)
5: R (green)
6: D (yellow)
7: B (blue)
*/

let solved_state = Array(72)
  .fill()
  .map((_, i) => (i / 9) | 0);

let move_U = permutation_from_cycles(
  [
    [0, 4, 8],
    [1, 6, 3],
    [2, 5, 7],
    [9, 22, 35],
    [45, 67, 44],
    [47, 68, 43],
    [46, 69, 39],
    [50, 70, 38],
    [49, 71, 36],
  ],
  72,
);
let move_Ui = compose(move_U, move_U);

let move_X = Array(72)
  .fill()
  .map((_, i) => ((i / 18) | 0) * 18 + ((i + 9) % 18));
let move_Y = Array(72)
  .fill()
  .map((_, i) => ((i / 36) | 0) * 36 + ((i + 18) % 36));
let move_Z = Array(72)
  .fill()
  .map((_, i) => (i + 36) % 72);

// Z changes sign, so this is really setting up to U' rather than U
move_L = compose3(move_Z, move_Ui, move_Z);
move_F = compose3(move_X, move_U, move_X);
move_R = compose3(move_X, move_L, move_X);

//let move_BR = compose3(move_Y, move_U, move_Y);
//let move_BL = compose3(move_Y, move_F, move_Y);
//let move_B = compose3(move_Y, move_R, move_Y);
//let move_D = compose3(move_Y, move_L, move_Y);

let move_Us = permutation_from_cycles(
  [
    [10, 24, 30],
    [11, 23, 34],
    [12, 19, 33],
    [42, 48, 64],
    [41, 52, 65],
    [37, 51, 66],
  ],
  72,
);
let move_Uw = compose(move_U, move_Us);
let move_Uwi = compose(move_Uw, move_Uw);

let move_Lw = compose3(move_Z, move_Uwi, move_Z);
let move_Fw = compose3(move_X, move_Uw, move_X);
let move_Rw = compose3(move_X, move_Lw, move_X);

let colour_map = Array(72)
  .fill()
  .map((_, i) => (i / 9) | 0);

let corner_piece_facelets = [
  [0, 45, 9, 36], // U-F
  [4, 67, 22, 49], // U-BR
  [8, 44, 35, 71], // U-BL
  [13, 58, 31, 40], // F-BL
  [17, 53, 26, 62], // F-BR
  [18, 63, 27, 54], // BR-BL
];

let edge_piece_facelets = [
  [1, 46], // U-R
  [3, 39], // U-L
  [6, 69], // U-B
  [10, 37], // F-L
  [33, 42], // BL-L
  [12, 48], // F-R  *
  [15, 60], // F-D  *
  [24, 51], // BR-R *
  [19, 64], // BR-B **
  [28, 55], // BL-D **
  [30, 66], // BL-B **
  [21, 57], // BR-D **
];

let centreA_piece_facelets = Array(12)
  .fill()
  .map((_, i) => ((i / 3) | 0) * 9 + [2, 5, 7][i % 3]);
let centreB_piece_facelets = centreA_piece_facelets.map((x) => x + 36);

/*
facelet definition sanity test:
all corner facelets are 0,4,8 mod 9; facelet order is always in U,R,U,R orbits
all edge facelets are 1,3,6 mod 9; facelet order is always in U,R orbits
all centre facelets are 2,5,7 mod 9

function facelet_sanity_test()
{
if (corner_piece_facelets.length !== 6) {console.log('wrong number of corner pieces'); return;}
if (edge_piece_facelets.length !== 12) {console.log('wrong number of edge pieces'); return;}
if (!corner_piece_facelets.every(x => {return x.every(y => y % 9 % 4 === 0) && x[0] < 36 && x[2] < 36 && x[1] >= 36 && x[3] >= 36;}))
{
	console.log('corner pieces weird');
	return;
}
if (!edge_piece_facelets.every(x => {return x.every(y => [1,3,6].indexOf(y % 9) !== -1) && x[0] < 36 && x[1] >= 36;}))
{
	console.log('edge pieces weird');
	return;
}
}

*/

function identify_corner_piece(colourA, colourB) {
  // return a 2-tuple [p, o] where
  // p in {0,1,2,3,4,5} is the corner piece's ID and
  // o in {0,1} is its orientation
  for (let i = 0; i < 6; i++) {
    if (
      colourA === colour_map[corner_piece_facelets[i][0]] &&
      colourB === colour_map[corner_piece_facelets[i][2]]
    ) {
      return [i, 0];
    } else if (
      colourA === colour_map[corner_piece_facelets[i][2]] &&
      colourB === colour_map[corner_piece_facelets[i][0]]
    ) {
      return [i, 1];
    }
  }
  throw new Error("unknown corner piece");
}

function identify_edge_piece(colourA, colourB) {
  // return p in {0..11} the edge piece's ID
  // (edges are not flippable on the FTO)
  for (let i = 0; i < 12; i++) {
    if (
      colourA === colour_map[edge_piece_facelets[i][0]] &&
      colourB === colour_map[edge_piece_facelets[i][1]]
    ) {
      return i;
    }
    if (
      colourB === colour_map[edge_piece_facelets[i][0]] &&
      colourA === colour_map[edge_piece_facelets[i][1]]
    ) {
      return i;
    }
  }
  throw new Error("unknown edge piece");
}

function get_corner_piece(facelets, location) {
  return identify_corner_piece(
    facelets[corner_piece_facelets[location][0]],
    facelets[corner_piece_facelets[location][2]],
  );
}

function get_edge_piece(facelets, location) {
  return identify_edge_piece(
    facelets[edge_piece_facelets[location][0]],
    facelets[edge_piece_facelets[location][1]],
  );
}

function set_corner_piece(facelets, location, value, orientation) {
  let indices = corner_piece_facelets[location];
  let colours = corner_piece_facelets[value].map((x) => colour_map[x]);
  if (orientation % 2 !== 0) {
    colours = [colours[2], colours[3], colours[0], colours[1]];
  }
  for (let i = 0; i < 4; i++) {
    facelets[indices[i]] = colours[i];
  }
}

function set_edge_piece(facelets, location, value) {
  let indices = edge_piece_facelets[location];
  let colours = edge_piece_facelets[value].map((x) => colour_map[x]);
  for (let i = 0; i < 2; i++) {
    facelets[indices[i]] = colours[i];
  }
}

function convert_move_to_permutations(move) {
  let state = move.map((x) => colour_map[x]);
  //console.log(state);
  let cp_raw = Array(6)
    .fill()
    .map((_, i) => get_corner_piece(state, i));
  let cp_half = cp_raw.map(([p, o]) => p + 6 * o);
  let cp = cp_half.concat(cp_half.map((x) => (x + 6) % 12));
  let ep = Array(12)
    .fill()
    .map((_, i) => get_edge_piece(state, i));
  let ap = Array(12)
    .fill()
    .map((_, i) =>
      centreA_piece_facelets.indexOf(move[centreA_piece_facelets[i]]),
    );
  let bp = Array(12)
    .fill()
    .map((_, i) =>
      centreB_piece_facelets.indexOf(move[centreB_piece_facelets[i]]),
    );
  return { cp: cp, ep: ep, ap: ap, bp: bp };
}

moves = [move_U, move_L, move_F, move_R, move_Uw, move_Lw, move_Fw, move_Rw];
move_names = ["U", "L", "F", "R", "u", "l", "f", "r"];

let move_permutations = moves.map(convert_move_to_permutations);

/*
let commute_table = (function () {
	let n = moves.length;
	let t = Array(n);
	for (let i = 0; i < n; i++)
	{
		t[i] = Array(n);
		for (let j = 0; j < n; j++)
		{
			let a = compose(moves[i], moves[j]);
			let b = compose(moves[j], moves[i]);
			t[i][j] = (a.join(' ') === b.join(' '));
		}
	}
	return t;
})();
*/

// generate a random state with the BR-BL corner solved
function random_state() {
  let facelets = Array(72);
  let cp = random_even_permutation(5);
  cp.push(5);
  let co = Array(4)
    .fill()
    .map((_) => rng.next(2));
  co.push(co.reduce((x, y) => x ^ y));
  co.push(0);
  for (let i = 0; i < 6; i++) {
    set_corner_piece(facelets, i, cp[i], co[i]);
  }

  let ep = random_even_permutation(12);
  for (let i = 0; i < 12; i++) {
    set_edge_piece(facelets, i, ep[i]);
  }

  let a = random_permutation(12).map((x) => (x / 3) | 0);
  let b = random_permutation(12).map((x) => 4 + ((x / 3) | 0));
  for (let i = 0; i < 12; i++) {
    facelets[centreA_piece_facelets[i]] = a[i];
    facelets[centreB_piece_facelets[i]] = b[i];
  }
  return facelets;
}

function stringify_move_sequence(move_sequence, no_wide = false) {
  if (no_wide) {
    const U = 0;
    const L = 1;
    const F = 2;
    const R = 3;
    const D = 4;
    const BR = 5;
    const B = 6;
    const BL = 7;
    move_sequence = move_sequence.map((x) => x.slice());
    let ordering = [U, L, F, R, D, BR, B, BL];
    let rotations = [
      [U, R, BR, B, D, BL, L, F],
      [BL, L, U, B, R, BR, D, F],
      [BL, D, F, L, R, U, B, BR],
      [F, D, BR, R, B, U, L, BL],
    ];
    rotations = rotations.concat(rotations.map((p) => invert_permutation(p)));
    for (let i = 0; i < move_sequence.length; i++) {
      if (move_sequence[i][0] < 4) {
        // it's already a single-layer turn
        move_sequence[i][0] = ordering[move_sequence[i][0]];
      } else {
        // it's a double-layer turn and we need to Do Stuff
        let m = ordering[move_sequence[i][0]];
        let r = move_sequence[i][1];
        move_sequence[i][0] = m;
        ordering = compose(r === 1 ? rotations[m ^ 4] : rotations[m], ordering);
        //console.log(ordering);
      }
    }
  }
  let names = no_wide ? "U L F R D BR B BL".split(" ") : move_names; // WARNING: this ordering is _not_ the same as the facelet colours
  let suffixes = ["0", "", "'"];
  let s = move_sequence.map(([m, r]) => names[m] + suffixes[r]);
  return s.join(" ");
}

function print_move_sequence(move_sequence) {
  console.log(stringify_move_sequence(move_sequence));
}

function apply_move_sequence(state, move_sequence) {
  for (let [m, r] of move_sequence) {
    for (let i = 0; i < r; i++) {
      state = compose(state, moves[m]);
    }
  }
  return state;
}

function invert_move_sequence(move_sequence) {
  return move_sequence.map(([m, r]) => [m, (3 - r) % 3]).reverse();
}

function simplify_move_sequence(move_sequence, make_noise = false) {
  if (move_sequence.length === 0) {
    return [];
  }
  let simplified = [];
  let last_move = undefined;
  for (let [m, r] of move_sequence) {
    if (last_move && last_move[0] === m) {
      // turn of the same face
      last_move[1] += r;
      last_move[1] %= 3;
      if (last_move[1] === 0) {
        simplified.pop();
        last_move =
          simplified.length === 0
            ? undefined
            : simplified[simplified.length - 1];
      }
    } else if (
      simplified.length >= 2 &&
      (last_move[0] ^ m) === 4 &&
      simplified[simplified.length - 2][0] === m
    ) {
      // turn of the opposite face
      simplified[simplified.length - 2][1] += r;
      simplified[simplified.length - 2][1] %= 3;
      if (simplified[simplified.length - 2][1] === 0) {
        simplified.splice(simplified.length - 2, 1);
      }
    } else {
      last_move = [m, r];
      simplified.push(last_move);
    }
  }
  if (make_noise && `${move_sequence}` !== `${simplified}`) {
    console.log(`simplified ${move_sequence} to ${simplified}`);
  }
  return simplified;
}

function generate_random_state_scramble() {
  return stringify_move_sequence(
    invert_move_sequence(solve(random_state(), true)),
    true,
  );
}

function generate_multiple_random_state_scrambles(n) {
  let scrambles = [];
  for (let i = 0; i < n; i++) {
    scrambles[i] = generate_random_state_scramble();
  }
  return scrambles;
}

/*
Actual solver logic goes here.

Unlike most of the earlier random-state scramblers I've written before, this one comes with a slight
complication: the FTO's states are _not_ a group. In other words, we can't skip inverting the
solution to get the scramble. Not a big deal.

We assume the D-BR-B-BL corner is solved. (If not, rotate puzzle accordingly.)

Phase 1: Solve a small pyramid around the D-BR-B-BL corner.
- centres #6, #9 in orbit A and #6, #9 in orbit B
- edges #8, #9, #10, #11
Reduction: (132/9)**2 * (12*11*10*9) = 2555520

Phase 2: Reduce to LU 2-gen.
- remaining BR, D centres, one each of F, R centres (#5, #7, #8 in each orbit)
- edges F-R, F-D, R-BR (#5, #6, #7)
- corner F-BR (#4)
- corner orientation constraint on the other four corners
Reduction: 120**2 * (8*7*6) * 10 * 4 = 193536000

Phase 3: Finish solve.
- remaining centres (#0..#4, #10, #11 in each orbit)
- edges #0..#4
- corners #0..#3
Reduction: 210**2 * (5!/2) * (4!/2*2) = 63504000


*/

function generate_mtable_comb_generic(n, k, permutations) {
  let N = C(n, k);
  let nmoves = permutations.length;
  let [itc, cti] = generate_comb_lookup_tables(n, k);
  let mtable = Array(nmoves)
    .fill()
    .map(() => new Uint32Array(N));
  for (let i = 0; i < N; i++) {
    let c = itc[i];
    let arr = Array(n);
    for (let j = 0; j < n; j++) {
      arr[j] = (c >> j) & 1;
    }
    for (let m = 0; m < nmoves; m++) {
      let arr2 = compose(arr, permutations[m]);
      let c2 = arr2.reduce((acc, x, j) => acc | (x << j), 0);
      mtable[m][i] = cti[c2];
    }
  }
  return mtable;
}

function generate_mtable_comb4_generic(n, k0, k1, k2, k3, permutations) {
  let N = C4(n, k0, k1, k2, k3);
  let nmoves = permutations.length;
  let [itc, cti] = generate_comb4_lookup_tables(n, k0, k1, k2, k3);
  let mtable = Array(nmoves)
    .fill()
    .map(() => new Uint32Array(N));
  for (let i = 0; i < N; i++) {
    let c = itc[i];
    let arr = Array(n);
    for (let j = 0; j < n; j++) {
      arr[j] = (c >> (2 * j)) & 3;
    }
    for (let m = 0; m < nmoves; m++) {
      let arr2 = compose(arr, permutations[m]);
      let c2 = arr2.reduce((acc, x, j) => acc | (x << (2 * j)), 0);
      mtable[m][i] = cti[c2];
    }
  }
  return mtable;
}

function generate_mtable_single_generic(permutations) {
  let n = permutations[0].length;
  let nmoves = permutations.length;
  let mtable = Array(nmoves)
    .fill()
    .map(() => new Uint32Array(n));
  for (let i = 0; i < n; i++) {
    for (let m = 0; m < nmoves; m++) {
      mtable[m][permutations[m][i]] = i;
      // we're using right-action convention here,
      // so we use the *inverse* of the permutation
      // to track how pieces move.
    }
  }
  return mtable;
}

function combine_mtables(mtable0, mtable1) {
  let n0 = mtable0[0].length;
  let n1 = mtable1[0].length;
  let nmoves = mtable0.length;
  let combined = Array(nmoves)
    .fill()
    .map(() => new Uint32Array(n0 * n1));
  for (let j = 0; j < n1; j++) {
    for (let i = 0; i < n0; i++) {
      let index = i + n0 * j;
      for (let m = 0; m < nmoves; m++) {
        combined[m][index] = mtable0[m][i] + n0 * mtable1[m][j];
      }
    }
  }
  return combined;
}

function trim_unreachable(mtable, origin) {
  // input: mtable
  // output: [trimmed mtable, map]
  let nmoves = mtable.length;
  let n = mtable[0].length;
  let reachable = new Uint8Array(n);
  reachable[origin] = 1;
  let done = false;
  while (!done) {
    done = true;
    for (let i = 0; i < n; i++) {
      if (!reachable[i]) {
        continue;
      }
      for (let m = 0; m < nmoves; m++) {
        if (!reachable[mtable[m][i]]) {
          reachable[mtable[m][i]] = 1;
          done = false;
        }
      }
    }
  }
  let map = new Int32Array(n).fill(-1);
  for (let i = 0, counter = 0; i < n; i++) {
    if (!reachable[i]) {
      continue;
    }
    map[i] = counter;
    counter++;
  }
  return [mtable.map((entry) => reduce_permutation(entry, reachable)), map];
}

function reduce_to_quotient(mtable, origins) {
  let nmoves = mtable.length;
  let n = mtable[0].length;
  let quotient_map = new Int32Array(n).fill(-1);
  origins.forEach((x) => {
    quotient_map[x] = 0;
  });
  let preimages = [origins];
  for (let image = 0; image < preimages.length; image++) {
    let equiv_class = preimages[image];
    for (let m = 0; m < nmoves; m++) {
      let j = mtable[m][equiv_class[0]];
      if (quotient_map[j] !== -1) {
        continue;
      } // already looked at those nodes
      let new_equiv_class = equiv_class.map((x) => mtable[m][x]);
      let new_image = preimages.length;
      preimages.push(new_equiv_class);
      for (let x of new_equiv_class) {
        if (quotient_map[x] !== -1) {
          throw new Error("quotienting failed");
        }
        quotient_map[x] = new_image;
      }
    }
  }
  let n_quot = preimages.length;
  let mtable_quot = Array(nmoves)
    .fill()
    .map(() => new Int32Array(n_quot));
  for (let m = 0; m < nmoves; m++) {
    for (let i = 0; i < n_quot; i++) {
      mtable_quot[m][i] = quotient_map[mtable[m][preimages[i][0]]];
    }
  }
  return [mtable_quot, quotient_map];
}

function generate_mirrored_coordinate_table(mtable, a, b) {
  let n = mtable[0].length;
  let nmoves = mtable.length;
  let mirror_map = new Int32Array(n).fill(-1);
  mirror_map[a] = b;
  mirror_map[b] = a;
  let done = false;
  while (!done) {
    done = true;
    for (let i = 0; i < n; i++) {
      if (mirror_map[i] === -1) {
        continue;
      }
      let I = mirror_map[i];
      for (let m = 0; m < nmoves; m++) {
        let M = m ^ 1;
        let new_i = mtable[m][i];
        let new_I = mtable[M][mtable[M][I]];
        // convert moves according to this table:
        // U -> L2
        // L -> U2
        // F -> R2
        // R -> F2
        if (mirror_map[new_i] === -1) {
          done = false;
          mirror_map[new_i] = new_I;
          mirror_map[new_I] = new_i;
        } else if (mirror_map[new_i] !== new_I) {
          throw new Error("mirroring failed - is the initial map correct?");
        }
      }
    }
  }
  return mirror_map;
}

function bfs(mtable, goal_states) {
  let N = mtable[0].length;
  let nmoves = mtable.length;
  let ptable = new Int8Array(N).fill(-1);
  for (let state of goal_states) {
    ptable[state] = 0;
  }
  let depth = 0;
  let done = false;
  while (!done) {
    done = true;
    for (let state = 0; state < N; state++) {
      if (ptable[state] !== depth) {
        continue;
      }
      for (let move_index = 0; move_index < nmoves; move_index++) {
        let new_state = mtable[move_index][state];
        while (new_state !== state) {
          if (ptable[new_state] === -1) {
            done = false;
            ptable[new_state] = depth + 1;
          }
          new_state = mtable[move_index][new_state];
        }
      }
    }
    depth++;
  }
  return ptable;
}

function* ida_solve_gen(indices, mtables, ptables, moves_left, commute) {
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (bound <= moves_left) {
    //console.log(`searching depth ${bound}`);
    yield* ida_search_gen(indices, mtables, ptables, bound, -1, commute);
    bound++;
  }
}

function* ida_search_gen(indices, mtables, ptables, bound, last, commute) {
  let ncoords = indices.length;
  let nmoves = mtables[0].length;
  let heuristic = 0;
  for (let i = 0; i < ncoords; i++) {
    heuristic = Math.max(heuristic, ptables[i][indices[i]]);
  }
  if (heuristic > bound) {
    return;
  }
  if (bound === 0) {
    yield [];
    return;
  }
  if (heuristic === 0 && bound === 1) {
    return;
  }
  for (let m = 0; m < nmoves; m++) {
    if (m === last) {
      continue;
    }
    if (m < last && commute[m][last]) {
      continue;
    }
    let new_indices = indices.slice();
    for (let c = 0; c < ncoords; c++) {
      new_indices[c] = mtables[c][m][indices[c]];
    }
    let r = 1;
    while (indices.some((_, i) => indices[i] !== new_indices[i])) {
      let subpath_gen = ida_search_gen(
        new_indices,
        mtables,
        ptables,
        bound - 1,
        m,
        commute,
      );
      while (true) {
        let { value: subpath, done } = subpath_gen.next();
        if (done) {
          break;
        }
        yield [[m, r]].concat(subpath);
      }
      for (let c = 0; c < ncoords; c++) {
        new_indices[c] = mtables[c][m][new_indices[c]];
      }
      r++;
    }
  }
}

function solve(facelets, readable = false) {
  let phase1sol = solve_phase1_gen(facelets).next().value;
  let facelets2 = apply_move_sequence(facelets, phase1sol);
  let phase2sol = (
    readable ? solve_phase2_and_phase3_readable : solve_phase2_and_phase3_fast
  )(facelets2);
  let solution = simplify_move_sequence(phase1sol.concat(phase2sol), false);
  if (
    apply_move_sequence(facelets, solution).join("") !== solved_state.join("")
  ) {
    console.log("solving failed!");
    console.log(facelets);
    console.log(phase1sol);
    console.log(facelets2);
    console.log(phase2sol);
    console.log(apply_move_sequence(facelets, solution));
  }
  return solution;
}

let cached_mtables = {};
let cached_ptables = {};

/* Phase 1 stuff */

let phase1_centre_colour_map = [0, 0, 2, 3, 0, 0, 2, 3];
function index_phase1(facelets) {
  let [itc, cti] = generate_comb4_lookup_tables(12, 6, 0, 3, 3);
  let ep = Array(12)
    .fill()
    .map((_, i) => get_edge_piece(facelets, i));
  let edge_coord =
    ep.indexOf(8) +
    12 * ep.indexOf(9) +
    12 ** 2 * ep.indexOf(10) +
    12 ** 3 * ep.indexOf(11);
  let [a_coord, b_coord] = [centreA_piece_facelets, centreB_piece_facelets].map(
    (facelet_indices) => {
      let arr = facelet_indices.map(
        (x) => phase1_centre_colour_map[facelets[x]],
      );
      return cti[arr.reduce((acc, x, j) => acc | (x << (2 * j)), 0)];
    },
  );
  return [edge_coord, a_coord, b_coord];
}

function generate_phase1_edge_mtable() {
  if (cached_mtables.phase1_edge) {
    return cached_mtables.phase1_edge;
  }
  let m1 = generate_mtable_single_generic(move_permutations.map((x) => x.ep));
  let m2 = combine_mtables(m1, m1);
  let m4 = combine_mtables(m2, m2);
  return (cached_mtables.phase1_edge = m4);
}

function generate_phase1_edge_ptable() {
  if (cached_ptables.phase1_edge) {
    return cached_ptables.phase1_edge;
  }
  return (cached_ptables.phase1_edge = bfs(generate_phase1_edge_mtable(), [
    8 + 12 * 9 + 12 ** 2 * 10 + 12 ** 3 * 11,
  ]));
}

function generate_phase1_centreA_mtable() {
  if (cached_mtables.phase1_centreA) {
    return cached_mtables.phase1_centreA;
  }
  return (cached_mtables.phase1_centreA = generate_mtable_comb4_generic(
    12,
    6,
    0,
    3,
    3,
    move_permutations.map((x) => x.ap),
  ));
}

function generate_phase1_centreB_mtable() {
  if (cached_mtables.phase1_centreB) {
    return cached_mtables.phase1_centreB;
  }
  return (cached_mtables.phase1_centreB = generate_mtable_comb4_generic(
    12,
    6,
    0,
    3,
    3,
    move_permutations.map((x) => x.bp),
  ));
}

function generate_phase1_centre_ptable() {
  // the pruning tables for the two centre orbits are identical due to the specific facelet
  // labelling we're using.
  if (cached_ptables.phase1_centre) {
    return cached_ptables.phase1_centre;
  }
  let [itc, cti] = generate_comb4_lookup_tables(12, 6, 0, 3, 3);
  let goal_states = itc
    .filter((x) => {
      let x6 = (x >> 12) & 3;
      let x9 = (x >> 18) & 3;
      return x6 === 2 && x9 === 3;
    })
    .map((x) => cti[x]);
  return (cached_ptables.phase1_centre = bfs(
    generate_phase1_centreB_mtable(),
    goal_states,
  ));
}

function* solve_phase1_gen(facelets) {
  let mtables = [
    generate_phase1_edge_mtable(),
    generate_phase1_centreA_mtable(),
    generate_phase1_centreB_mtable(),
  ];
  let ptables = [
    generate_phase1_edge_ptable(),
    generate_phase1_centre_ptable(),
    generate_phase1_centre_ptable(),
  ];
  yield* phase1_ida_solve_gen(index_phase1(facelets), mtables, ptables, 15);
}

function* phase1_ida_solve_gen(indices, mtables, ptables, moves_left) {
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (bound <= moves_left) {
    //console.log(`searching depth ${bound}`);
    yield* phase1_ida_search_gen(indices, mtables, ptables, bound, -1);
    bound++;
  }
}

function* phase1_ida_search_gen(indices, mtables, ptables, bound, last) {
  let ncoords = 3; //indices.length;
  let nmoves = 8; //mtables[0].length;
  let heuristic = Math.max(
    ptables[0][indices[0]],
    ptables[1][indices[1]],
    ptables[2][indices[2]],
  ); //0;
  //for (let i = 0; i < ncoords; i++) heuristic = Math.max(heuristic, ptables[i][indices[i]]);
  if (heuristic > bound) {
    return;
  }
  if (bound === 0) {
    yield [];
    return;
  }
  if (heuristic === 0 && bound === 1) {
    return;
  }
  for (let m = 0; m < nmoves; m++) {
    if (m === last) {
      continue;
    }
    if (m === last - 4) {
      continue;
    }
    let new_indices = [];
    new_indices[0] = mtables[0][m][indices[0]];
    new_indices[1] = mtables[1][m][indices[1]];
    new_indices[2] = mtables[2][m][indices[2]];
    let r = 1;
    while (indices.some((_, i) => indices[i] !== new_indices[i])) {
      let subpath_gen = phase1_ida_search_gen(
        new_indices,
        mtables,
        ptables,
        bound - 1,
        m,
      );
      while (true) {
        let { value: subpath, done } = subpath_gen.next();
        if (done) {
          break;
        }
        yield [[m, r]].concat(subpath);
      }
      new_indices[0] = mtables[0][m][new_indices[0]];
      new_indices[1] = mtables[1][m][new_indices[1]];
      new_indices[2] = mtables[2][m][new_indices[2]];
      r++;
    }
  }
}

/* Phase 2 stuff */

let phase2_centre_colour_map = [0, 1, 2, 0, 0, 1, 2, 0];
// we don't care about swapping U and BL centres in phase 2

let phase2_centre_indices = [0, 1, 2, 3, 4, 5, 7, 8, 10, 11]; // 6 and 9 are already solved in phase 1
let phase2_keep = [
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  false,
  true,
  true,
];
let phase2_corner_keep = [
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  false,
];

function index_phase2(facelets) {
  let [itc, cti] = generate_comb4_lookup_tables(10, 5, 3, 2, 0);
  let ep = Array(8)
    .fill()
    .map((_, i) => get_edge_piece(facelets, i));
  let edge_coord = ep.indexOf(5) + 8 * ep.indexOf(6) + 8 ** 2 * ep.indexOf(7);
  let corners = Array(5)
    .fill()
    .map((_, i) => get_corner_piece(facelets, i));
  let cp_inverse_full = invert_permutation(
    corners
      .map(([p, o]) => p + 5 * o)
      .concat(corners.map(([p, o]) => p + 5 * (o ^ 1))),
  );
  let cp_inverse = cp_inverse_full.slice(0, 5).map((x) => x % 5);
  let co_inverse = cp_inverse_full.slice(0, 5).map((x) => (x / 5) | 0);
  let corner_coord =
    evenpermutation_to_index(cp_inverse) * 8 +
    (co_inverse[0] ^ co_inverse[2]) +
    2 * (co_inverse[0] ^ co_inverse[3]) +
    4 * co_inverse[4];
  let [a_coord, b_coord] = [centreA_piece_facelets, centreB_piece_facelets].map(
    (facelet_indices) => {
      let arr = compose(facelet_indices, phase2_centre_indices).map(
        (x) => phase2_centre_colour_map[facelets[x]],
      );
      return cti[arr.reduce((acc, x, j) => acc | (x << (2 * j)), 0)];
    },
  );
  // we don't need these move tables, but we do need the reduction maps
  // that are computed with these (and stored in global vars, yikes)
  generate_phase2_edge_mtable();
  generate_phase2_corner_mtable_compact();
  return [
    a_coord,
    b_coord,
    phase2_corner_reduction_map[corner_coord] +
      40 * phase2_edge_reduction_map[edge_coord],
  ];
}

function* solve_phase2_gen(facelets) {
  yield* phase2_ida_solve_gen(index_phase2(facelets), 30);
}

function solve_phase2(facelets) {
  return solve_phase2_gen(facelets).next().value;
}

function generate_phase2_centre_mtables() {
  if (cached_mtables.phase2_centre) {
    return cached_mtables.phase2_centre;
  }
  let a = generate_mtable_comb4_generic(
    10,
    5,
    3,
    2,
    0,
    move_permutations
      .slice(0, 4)
      .map((x) => reduce_permutation(x.ap, phase2_keep)),
  );
  let b = generate_mtable_comb4_generic(
    10,
    5,
    3,
    2,
    0,
    move_permutations
      .slice(0, 4)
      .map((x) => reduce_permutation(x.bp, phase2_keep)),
  );
  return (cached_mtables.phase2_centre = [a, b]);
}

let phase2_edge_reduction_map;
function generate_phase2_edge_mtable() {
  if (cached_mtables.phase2_edge) {
    return cached_mtables.phase2_edge;
  }
  let e = generate_mtable_single_generic(
    move_permutations.slice(0, 4).map((x) => x.ep.slice(0, 8)),
  );
  let eee = combine_mtables(e, combine_mtables(e, e));
  let eee_trimmed;
  [eee_trimmed, phase2_edge_reduction_map] = trim_unreachable(eee, 0o765);
  return (cached_mtables.phase2_edge = eee_trimmed);
}

function generate_phase2_corner_mtable() {
  if (cached_mtables.phase2_corner) {
    return cached_mtables.phase2_corner;
  }
  const HALFFACT5 = factorial(5) / 2; // = 60
  const N = HALFFACT5 * 8; // = 480
  const keep = [
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
  ];
  // ignore the sixth and twelfth entries, which encode corner #5's state
  let mtable = Array(4)
    .fill()
    .map(() => new Uint32Array(N));
  let permutations = move_permutations
    .slice(0, 4)
    .map((x) => invert_permutation(reduce_permutation(x.cp, keep)));
  // using the left-action convention here, so take inverses
  for (let i = 0; i < N; i++) {
    let p = index_to_evenpermutation(i >> 3, 5);
    let o = [0, 0, i & 1, (i >> 1) & 1, (i >> 2) & 1];
    o[1] = o[2] ^ o[3] ^ o[4];
    let cp = Array(10);
    for (let j = 0; j < 5; j++) {
      cp[j] = p[j] + 5 * o[j];
      cp[j + 5] = p[j] + 5 * (o[j] ^ 1);
    }
    for (let m = 0; m < 4; m++) {
      let cp2 = compose(permutations[m], cp);
      let p2 = cp2.slice(0, 5).map((x) => x % 5);
      let o2 = cp2.slice(0, 5).map((x) => (x / 5) | 0);
      let orientation_index = (o2[0] ^ o2[2]) + 2 * (o2[0] ^ o2[3]) + 4 * o2[4];
      mtable[m][i] = evenpermutation_to_index(p2) * 8 + orientation_index;
    }
  }
  return (cached_mtables.phase2_corner = mtable);
  /*
	far as I can tell, there's no clean way to index the cosets of the corner subgroup in this
	phase. so we just do it the dirty way (see `reduce_to_quotient`).
	*/
}

let phase2_corner_reduction_map;
function generate_phase2_corner_mtable_compact() {
  if (cached_mtables.phase2_corner_compact) {
    return cached_mtables.phase2_corner_compact;
  }
  [cached_mtables.phase2_corner_compact, phase2_corner_reduction_map] =
    reduce_to_quotient(
      generate_phase2_corner_mtable(),
      phase2_corner_goal_states(),
    );
  return cached_mtables.phase2_corner_compact;
}

function generate_phase2_ce_mtable() {
  if (cached_mtables.phase2_ce) {
    return cached_mtables.phase2_ce;
  }
  let c = generate_phase2_corner_mtable_compact();
  let e = generate_phase2_edge_mtable();
  return (cached_mtables.phase2_ce = combine_mtables(c, e));
}

let phase2_ce_mirror_map;
function generate_phase2_ce_mirror_map() {
  if (phase2_ce_mirror_map) {
    return phase2_ce_mirror_map;
  }
  const ce_solved = index_phase2(solved_state)[2];
  return (phase2_ce_mirror_map = generate_mirrored_coordinate_table(
    generate_phase2_ce_mtable(),
    ce_solved,
    ce_solved,
  ));
}

function phase2_centre_goal_states() {
  let [itc, cti] = generate_comb4_lookup_tables(10, 5, 3, 2, 0);
  return itc.filter((x) => ((x >> 10) & 63) === 41).map((x) => cti[x]);
  /*
	the combination tracks the centre pieces at indices
	0, 1, 2, 3, 4, 5, 7, 8, 10, 11
	in little endian order.
	right-shifting 10 bits changes this to
	5, 7, 8, 10, 11
	and masking by 63 keeps only the three least significant digits
	5, 7, 8
	which are exactly the pieces we're solving in this phase.
	1 + 4 * 2 + 4**2 * 2 = 41
	WARNING: this needs to be adjusted if the centre indexing is changed
	(also, this returns a Uint32Array, but nothing we do here can possibly cause overflow so
	that's not a problem)
	*/
}

function phase2_corner_goal_states() {
  let mtable = generate_phase2_corner_mtable();
  let N = mtable[0].length;
  let flags = Array(N).fill(false);
  flags[0] = true; /* index 0 is the solved state */
  let done = false;
  while (!done) {
    done = true;
    for (let i = 0; i < N; i++) {
      if (flags[i]) {
        if (!flags[mtable[0][i]]) {
          done = false;
          flags[mtable[0][i]] = true;
        }
        if (!flags[mtable[1][i]]) {
          done = false;
          flags[mtable[1][i]] = true;
        }
      }
    }
  }
  return flags.map((_, i) => i).filter((i) => flags[i]);
}

function generate_phase2_ace_ptable() {
  if (cached_ptables.phase2_ace) {
    return cached_ptables.phase2_ace;
  }
  const [mtable_a, mtable_b] = generate_phase2_centre_mtables();
  const mtable_ce = generate_phase2_ce_mtable();
  const Na = 2520;
  const Nce = 40 * 336;
  const N = Na * Nce; // = 33868800
  const ce_solved = index_phase2(solved_state)[2];
  const max_depth = 9;
  let ptable = new Int8Array(N).fill(max_depth);
  for (let a_solved of phase2_centre_goal_states()) {
    ptable[a_solved + Na * ce_solved] = 0;
  }
  for (let depth = 0; depth < max_depth - 1; depth++) {
    for (
      let state = ptable.indexOf(depth);
      state !== -1;
      state = ptable.indexOf(depth, state + 1)
    ) {
      let a = state % Na;
      let ce = (state / Na) | 0;
      for (let move_index = 0; move_index < 4; move_index++) {
        let new_a = mtable_a[move_index][a];
        let new_ce = mtable_ce[move_index][ce];
        let new_state = new_a + Na * new_ce;
        if (ptable[new_state] === max_depth) {
          ptable[new_state] = depth + 1;
        }
        new_a = mtable_a[move_index][new_a];
        new_ce = mtable_ce[move_index][new_ce];
        new_state = new_a + Na * new_ce;
        if (ptable[new_state] === max_depth) {
          ptable[new_state] = depth + 1;
        }
      }
    }
  }
  // don't bother filling in the table for depth >=10; this saves a substantial amount of time
  // on startup at a slight cost of pruning effectiveness
  return (cached_ptables.phase2_ace = ptable);
}

function* phase2_ida_solve_gen(indices, moves_left) {
  let [mtable_a, mtable_b] = generate_phase2_centre_mtables();
  let mtable_ce = generate_phase2_ce_mtable();
  let ptable_ace = generate_phase2_ace_ptable();
  let mirror_map = generate_phase2_ce_mirror_map();
  let [a, b, ce] = indices;
  let ce_mirror = mirror_map[ce];
  let bound = Math.max(
    ptable_ace[a + 2520 * ce],
    ptable_ace[b + 2520 * ce_mirror],
  );
  while (bound <= moves_left) {
    //console.log(`searching depth ${bound}`);
    yield* phase2_ida_search_gen(
      a,
      b,
      ce,
      mtable_a,
      mtable_b,
      mtable_ce,
      ptable_ace,
      mirror_map,
      bound,
      -1,
    );
    bound++;
  }
}

function* phase2_ida_search_gen(
  a,
  b,
  ce,
  mtable_a,
  mtable_b,
  mtable_ce,
  ptable_ace,
  mirror_map,
  bound,
  last,
) {
  let h = Math.max(
    ptable_ace[a + 2520 * ce],
    ptable_ace[b + 2520 * mirror_map[ce]],
  );
  if (h > bound) {
    return;
  }
  if (bound === 0) {
    yield [];
    return;
  } else if (h === 0) {
    return;
  }
  for (let m = 0; m < 4; m++) {
    if (m === last) {
      continue;
    }
    let new_a = a;
    let new_b = b;
    let new_ce = ce;
    for (let r = 1; r <= 2; r++) {
      new_a = mtable_a[m][new_a];
      new_b = mtable_b[m][new_b];
      new_ce = mtable_ce[m][new_ce];
      let subpath_gen = phase2_ida_search_gen(
        new_a,
        new_b,
        new_ce,
        mtable_a,
        mtable_b,
        mtable_ce,
        ptable_ace,
        mirror_map,
        bound - 1,
        m,
      );
      while (true) {
        let { value: subpath, done } = subpath_gen.next();
        if (done) {
          break;
        }
        yield [[m, r]].concat(subpath);
      }
    }
  }
}

/* Phase 3 mostly-2-gen stuff */

let phase3_2gen_centre_indices = [0, 1, 2, 3, 4, 10, 11];

let phase3_2gen_keep = [
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  false,
  false,
  true,
  true,
];

let phase3_2gen_move_seqs = [
  [[0, 1]], // U
  [[1, 1]], // L

  // F U R U' R' F'
  [
    [2, 1],
    [0, 1],
    [3, 1],
    [0, 2],
    [3, 2],
    [2, 2],
  ],
  [
    [3, 2],
    [1, 2],
    [2, 2],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
  [
    [6, 1],
    [0, 1],
    [3, 1],
    [0, 2],
    [3, 2],
    [6, 2],
  ],
  [
    [7, 2],
    [1, 2],
    [2, 2],
    [1, 1],
    [2, 1],
    [7, 1],
  ],

  // F U F' U F U F'
  [
    [2, 1],
    [0, 1],
    [2, 2],
    [0, 1],
    [2, 1],
    [0, 1],
    [2, 2],
  ],
  [
    [3, 2],
    [1, 1],
    [3, 1],
    [1, 1],
    [3, 2],
    [1, 1],
    [3, 1],
  ],

  // F R F' L' U' F R F'
  [
    [2, 1],
    [3, 1],
    [2, 2],
    [1, 2],
    [0, 2],
    [2, 1],
    [3, 1],
    [2, 2],
  ],
  [
    [3, 2],
    [2, 2],
    [3, 1],
    [0, 1],
    [1, 1],
    [3, 2],
    [2, 2],
    [3, 1],
  ],
  [
    [6, 1],
    [0, 1],
    [6, 2],
    [0, 2],
    [1, 2],
    [6, 1],
    [0, 1],
    [6, 2],
  ],
  [
    [7, 2],
    [1, 2],
    [7, 1],
    [1, 1],
    [0, 1],
    [7, 2],
    [1, 2],
    [7, 1],
  ],

  // F R' F' R U F' L F
  [
    [2, 1],
    [3, 2],
    [2, 2],
    [3, 1],
    [0, 1],
    [2, 2],
    [1, 1],
    [2, 1],
  ],
  [
    [3, 2],
    [2, 1],
    [3, 1],
    [2, 2],
    [1, 2],
    [3, 1],
    [0, 2],
    [3, 2],
  ],
  [
    [6, 1],
    [0, 2],
    [6, 2],
    [7, 1],
    [6, 1],
    [1, 2],
    [7, 1],
    [6, 1],
  ],
  [
    [7, 2],
    [1, 1],
    [7, 1],
    [6, 2],
    [7, 2],
    [0, 1],
    [6, 2],
    [7, 2],
  ],

  // F' L' F' R' F' R' U' R'
  [
    [2, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [2, 2],
    [3, 2],
    [0, 2],
    [3, 2],
  ],
  [
    [6, 2],
    [7, 2],
    [1, 2],
    [0, 2],
    [1, 2],
    [0, 2],
    [6, 2],
    [7, 2],
  ],
  /*
[[2,1], [0,2], [2,2], [0,2], [2,1], [3,1], [0,2], [3,2], [2,2]], // F U' F' U' F R U' R' F'
[[3,2], [1,1], [3,1], [1,1], [3,2], [2,2], [1,1], [2,1], [3,1]], // R' L R L R' F' L F R
[[6,1], [3,2], [6,2], [1,2], [6,1], [0,1], [3,2], [0,2], [6,2]], // f R' f' L' f U R' U' f'
[[7,2], [2,1], [7,1], [0,1], [7,2], [1,2], [2,1], [1,1], [7,1]], // r' F r U r' L' F L r
[[2,1], [0,1], [3,1], [0,2], [3,2], [0,1], [3,1], [0,2], [3,2], [2,2]], // F (U R U' R')2 F'
[[3,2], [1,2], [2,2], [1,1], [2,1], [1,2], [2,2], [1,1], [2,1], [3,1]], // R' (L' F' L F)2 R
[[6,1], [0,1], [3,1], [0,2], [3,2], [0,1], [3,1], [0,2], [3,2], [6,2]], // f (U R U' R')2 f'
[[7,2], [1,2], [2,2], [1,1], [2,1], [1,2], [2,2], [1,1], [2,1], [7,1]], // r' (L' F' L F)2 r
*/
];
phase3_2gen_move_seqs = phase3_2gen_move_seqs.concat(
  phase3_2gen_move_seqs.map((seq) => invert_move_sequence(seq)),
);
let phase3_2gen_nmoves = phase3_2gen_move_seqs.length; // = 36
/*
The moves we're using for this phase:
U
L
F U R U' R' F'
R' L' F' L F R
f U R U' R' f'
r' L' F' L F r
F U F' U F U F' (= F' U F U F' U F = r' F r U r' F r = r l U' l F l r')
R' L R L R' L R (= R L R' L R L R' = f R f' L f R f' = f' u R u L' u f)

F R F' L' U' F R F'
R' F' R U L R' F' R
f U f' U' L' f U f'
r' L' r L U r' L' r

F R' F' R U F' L F
R' F R F' L' R U' R'
f U' f' r f L' r f
r' L r f' r' U f' r'

F' L' F' R' F' R' U' R'
f' r' L' U' L' U' f' r'

and the inverses of the above

These are the atomic 4-gen move sequences of length <= 8 where the induced permutations lie in the
<U,L> group (verified with GAP, barring transcription errors).

Temporarily going out of LU 2-gen can sometimes save _many_ moves, e.g. the F R U R' U' F' scramble
obviously has a 6-move 4-gen solution (F U R U' R' F'), but the optimal 2-gen solution is 24 moves:
U L' U L' U' L' U' L U' L U L' U L' U L U L' U' L U' L U L'.
*/

let phase3_2gen_facelet_permutations = phase3_2gen_move_seqs.map((seq) =>
  apply_move_sequence(permutation_from_cycles([], 72), seq),
);
let phase3_2gen_piece_permutations = phase3_2gen_facelet_permutations.map(
  convert_move_to_permutations,
);
let phase3_2gen_move_orders =
  phase3_2gen_facelet_permutations.map(permutation_order);

function index_phase3_2gen(facelets) {
  let [itc, cti] = generate_comb4_lookup_tables(7, 3, 2, 0, 2);
  let ep = Array(5)
    .fill()
    .map((_, i) => get_edge_piece(facelets, i));
  let edge_coord = evenpermutation_to_index(ep);
  let corners = Array(4)
    .fill()
    .map((_, i) => get_corner_piece(facelets, i));
  let corner_coord =
    evenpermutation_to_index(corners.map((x) => x[0])) * 2 +
    corners.find((x) => x[0] === 0)[1];
  let [a_coord, b_coord] = [centreA_piece_facelets, centreB_piece_facelets].map(
    (facelet_indices) => {
      let arr = compose(facelet_indices, phase3_2gen_centre_indices).map(
        (x) => facelets[x] % 4,
      );
      return cti[arr.reduce((acc, x, j) => acc | (x << (2 * j)), 0)];
    },
  );
  return [a_coord + 210 * b_coord, corner_coord + 24 * edge_coord];
}

function generate_phase3_2gen_edge_mtable() {
  if (cached_mtables.phase3_2gen_edge) {
    return cached_mtables.phase3_2gen_edge;
  }
  const HALFFACT5 = factorial(5) / 2; // = 60
  let mtable = Array(phase3_2gen_nmoves)
    .fill()
    .map(() => new Uint32Array(HALFFACT5));
  let permutations = phase3_2gen_piece_permutations.map((x) =>
    x.ep.slice(0, 5),
  );
  for (let i = 0; i < HALFFACT5; i++) {
    let p = index_to_evenpermutation(i, 5);
    for (let m = 0; m < phase3_2gen_nmoves; m++) {
      mtable[m][i] = evenpermutation_to_index(compose(p, permutations[m]));
    }
  }
  return (cached_mtables.phase3_2gen_edge = mtable);
}

// the group of corner states is the binary tetrahedral group 2T, where |2T| = 24
function generate_phase3_2gen_corner_mtable() {
  if (cached_mtables.phase3_2gen_corner) {
    return cached_mtables.phase3_2gen_corner;
  }
  const HALFFACT4 = factorial(4) / 2; // = 12
  const N = HALFFACT4 * 2; // = 24
  const keep = [
    true,
    true,
    true,
    true,
    false,
    false,
    true,
    true,
    true,
    true,
    false,
    false,
  ];
  let mtable = Array(phase3_2gen_nmoves)
    .fill()
    .map(() => new Uint32Array(N));
  let permutations = phase3_2gen_piece_permutations.map((x) =>
    reduce_permutation(x.cp, keep).slice(0, 4),
  );
  for (let i = 0; i < N; i += 2) {
    let p = index_to_evenpermutation(i >> 1, 4);
    let cp = p.concat(p.map((x) => x + 4));
    for (let m = 0; m < phase3_2gen_nmoves; m++) {
      let cp2 = compose(cp, permutations[m]);
      let p2 = cp2.map((x) => x % 4);
      let o2 = cp2.find((x) => x % 4 === 0) >> 2;
      mtable[m][i] = evenpermutation_to_index(p2) * 2 + o2;
      mtable[m][i + 1] = evenpermutation_to_index(p2) * 2 + (o2 ^ 1);
    }
  }
  return (cached_mtables.phase3_2gen_corner = mtable);
}

function generate_phase3_2gen_corneredge_mtable() {
  if (cached_mtables.phase3_2gen_corneredge) {
    return cached_mtables.phase3_2gen_corneredge;
  }
  return (cached_mtables.phase3_2gen_corneredge = combine_mtables(
    generate_phase3_2gen_corner_mtable(),
    generate_phase3_2gen_edge_mtable(),
  ));
}

function generate_phase3_2gen_centre_mtable() {
  if (cached_mtables.phase3_2gen_centre) {
    return cached_mtables.phase3_2gen_centre;
  }
  let mtable_a = generate_mtable_comb4_generic(
    7,
    3,
    2,
    0,
    2,
    phase3_2gen_piece_permutations.map((x) =>
      reduce_permutation(x.ap, phase3_2gen_keep),
    ),
  );
  let mtable_b = generate_mtable_comb4_generic(
    7,
    3,
    2,
    0,
    2,
    phase3_2gen_piece_permutations.map((x) =>
      reduce_permutation(x.bp, phase3_2gen_keep),
    ),
  );
  return (cached_mtables.phase3_2gen_centre = combine_mtables(
    mtable_a,
    mtable_b,
  ));
}

let phase3_2gen_depth_table;
function generate_phase3_2gen_depth_table() {
  if (phase3_2gen_depth_table) {
    return phase3_2gen_depth_table;
  }
  const mtable_ab = generate_phase3_2gen_centre_mtable();
  const mtable_ce = generate_phase3_2gen_corneredge_mtable();
  const Nab = mtable_ab[0].length; // = 44100
  const Nce = mtable_ce[0].length; // = 1440
  const N = Nab * Nce; // = 63504000
  const max_depth = 25; // pre-determined; hard-coding this makes the algorithm a bit faster
  const all_weights = phase3_2gen_move_seqs.map((seq) => seq.length);
  const table = new Int8Array(N).fill(max_depth);
  const solved_indices = index_phase3_2gen(solved_state);
  table[solved_indices[0] + Nab * solved_indices[1]] = 0;
  let depth = 0;
  let done = false;
  while (!done && depth < max_depth - 1) {
    done = true;
    //console.log(`scanning depth ${depth}`);
    let move_indices = Array(phase3_2gen_nmoves)
      .fill()
      .map((x, i) => i)
      .filter((m) => all_weights[m] + depth < max_depth);
    move_indices.sort((m, mm) => all_weights[m] - all_weights[mm]);
    let weights = compose(all_weights, move_indices);
    let mtable_ab_pruned = compose(mtable_ab, move_indices);
    let mtable_ce_pruned = compose(mtable_ce, move_indices);
    let nmoves = move_indices.length;
    //console.log(move_indices);
    for (
      let state = table.indexOf(depth);
      state !== -1;
      state = table.indexOf(depth, state + 1)
    ) {
      let ab = state % Nab;
      let ce = (state / Nab) | 0;
      for (let mi = 0; mi < nmoves; mi++) {
        let weight = weights[mi];
        let new_ab = mtable_ab_pruned[mi][ab];
        let new_ce = mtable_ce_pruned[mi][ce];
        let new_state = new_ab + Nab * new_ce;
        if (table[new_state] > depth + weight) {
          done = false;
          table[new_state] = depth + weight;
        }
      }
    }
    depth++;
  }
  return (phase3_2gen_depth_table = table);
}

function solve_phase3_2gen(
  facelets,
  indices = index_phase3_2gen(facelets),
  simplify = true,
) {
  let [ab, ce] = indices;
  let Nab = 44100;
  let mtable_ab = generate_phase3_2gen_centre_mtable();
  let mtable_ce = generate_phase3_2gen_corneredge_mtable();
  let depth_table = generate_phase3_2gen_depth_table();
  let seq = [];
  while (depth_table[ab + Nab * ce] > 0) {
    let distance = depth_table[ab + Nab * ce];
    for (let m = 0; m < phase3_2gen_nmoves; m++) {
      let new_ab = mtable_ab[m][ab];
      let new_ce = mtable_ce[m][ce];
      let new_distance = depth_table[new_ab + Nab * new_ce];
      if (new_distance === distance - phase3_2gen_move_seqs[m].length) {
        seq = seq.concat(phase3_2gen_move_seqs[m]);
        ab = new_ab;
        ce = new_ce;
        break;
      }
    }
  }
  return simplify ? simplify_move_sequence(seq) : seq;
}

function solve_phase3_2gen_readable(
  facelets,
  indices = index_phase3_2gen(facelets),
) {
  //const THRESHOLD = 31;
  let [ab, ce] = indices;
  let mtable_ab = generate_phase3_2gen_centre_mtable();
  let mtable_ce = generate_phase3_2gen_corneredge_mtable();
  let depth_table = generate_phase3_2gen_depth_table();
  let initial = depth_table[ab + 44100 * ce];
  let best_score = Infinity;
  let best_solution;
  //console.log(`initial: ${initial}`);
  search: for (let bound = initial; bound <= initial + 0; bound++) {
    let gen = solve_phase3_2gen_ida(
      ab,
      ce,
      mtable_ab,
      mtable_ce,
      depth_table,
      bound,
    );
    for (let solution of gen) {
      let expanded = solution.map((m) => phase3_2gen_move_seqs[m]).flat();
      let simplified = simplify_move_sequence(expanded);
      let score = grade_readability(simplified);
      if (score < best_score) {
        best_score = score;
        best_solution = simplified;
        //console.log(`${score} ${stringify_move_sequence(simplified, true)}`);
        //if (score <= THRESHOLD) {break search;}
      }
    }
  }
  return best_solution;
}

function alternation_penalty(x) {
  return ((x - 1) * (x - 2)) / 2;
  // A B A B A       costs 1
  // A B A B A B     costs 3
  // A B A B A B A   costs 6
  // A B A B A B A B costs 10
  // etc.
  // this should be chosen to be a convex function
}

function grade_readability(seq) {
  let nowide = stringify_move_sequence(seq, true).replace(/'/g, "").split(" ");
  return (
    seq.length +
    alternations(nowide)
      .map(alternation_penalty)
      .reduce((x, y) => x + y, 0)
  );
}

function alternations(seq) {
  // return a list of "alternating" run lengths
  // convention:
  // A B       does not count
  // A B A     counts as length 1
  // A B A B   counts as length 2
  // A B A B A counts as length 3
  // etc.
  if (seq.length < 3) {
    return [];
  }
  let n = seq.length;
  let a = [];
  for (let i = 0; i < n - 2; i++) {
    a[i] = seq[i] === seq[i + 2];
  }
  a.push(false);
  let i = -1;
  let runs = [];
  while (i < n - 2) {
    i = a.indexOf(true, i + 1);
    if (i === -1) {
      break;
    }
    let j = a.indexOf(false, i + 1);
    runs.push(j - i);
    i = j;
  }
  return runs;
}

function* solve_phase3_2gen_ida(
  ab,
  ce,
  mtable_ab,
  mtable_ce,
  depth_table,
  bound,
  last = -1,
) {
  let h = depth_table[ab + 44100 * ce];
  if (h > bound) {
    return;
  }
  if (bound === 0) {
    yield [];
    return;
  }
  if (h === 0) {
    return;
  } // this solution includes redundant moves
  for (let m = 0; m < phase3_2gen_nmoves; m++) {
    if (m === last && phase3_2gen_move_orders[m] <= 3) {
      continue;
    }
    let new_ab = mtable_ab[m][ab];
    let new_ce = mtable_ce[m][ce];
    let new_bound = bound - phase3_2gen_move_seqs[m].length;
    if (new_bound < 0) {
      continue;
    }
    let subpath_gen = solve_phase3_2gen_ida(
      new_ab,
      new_ce,
      mtable_ab,
      mtable_ce,
      depth_table,
      new_bound,
      m,
    );
    while (true) {
      let { value: subpath, done } = subpath_gen.next();
      if (done) {
        break;
      }
      yield [m].concat(subpath);
    }
  }
}

/* Some glue code */

function solve_phase2_and_phase3_fast(
  facelets,
  phase2_attempts = 200,
  cap = 24,
) {
  let pool = [];
  let gen = solve_phase2_gen(facelets);
  let facelets_t2 = compose(facelets, move_X).map((x) => x ^ 1);
  let gen_t2 = solve_phase2_gen(facelets_t2);
  let best = Array(1000);
  // phase 2 always takes <= 15 moves and phase 3 <= 25 moves, so this is a safe upper bound
  for (let i = 0; i < phase2_attempts; i++) {
    {
      let { value, done } = gen.next();
      if (!done) {
        let intermediate_facelets = apply_move_sequence(facelets, value);
        let solution = value.concat(solve_phase3_2gen(intermediate_facelets));
        if (solution.length <= cap) {
          return solution;
        } else if (solution.length < best.length) {
          best = solution;
        }
      }
    }
    {
      let { value, done } = gen_t2.next();
      if (!done) {
        let intermediate_facelets = apply_move_sequence(facelets_t2, value);
        let solution = value
          .concat(solve_phase3_2gen(intermediate_facelets))
          .map(([m, r]) => [m ^ 2, r]);
        if (solution.length <= cap) {
          return solution;
        } else if (solution.length < best.length) {
          best = solution;
        }
      }
    }
  }
  return best;
}

function solve_phase2_and_phase3_readable(
  facelets,
  phase2_attempts = 20,
  cap = 30,
) {
  let pool = [];
  let gen = solve_phase2_gen(facelets);
  let facelets_t2 = compose(facelets, move_X).map((x) => x ^ 1);
  let gen_t2 = solve_phase2_gen(facelets_t2);
  let best;
  let best_score = Infinity;
  for (let i = 0; i < phase2_attempts; i++) {
    {
      let { value, done } = gen.next();
      if (!done) {
        let intermediate_facelets = apply_move_sequence(facelets, value);
        let solution = simplify_move_sequence(
          value.concat(solve_phase3_2gen_readable(intermediate_facelets)),
        );
        let score = grade_readability(solution);
        if (score <= cap) {
          return solution;
        } else if (score < best_score) {
          best = solution;
          best_score = score;
        }
      }
    }
    {
      let { value, done } = gen_t2.next();
      if (!done) {
        let intermediate_facelets = apply_move_sequence(facelets_t2, value);
        let solution = simplify_move_sequence(
          value.concat(solve_phase3_2gen_readable(intermediate_facelets)),
        );
        solution = solution.map(([m, r]) => [m ^ 2, r]);
        let score = grade_readability(solution);
        if (score <= cap) {
          return solution;
        } else if (score < best_score) {
          best = solution;
          best_score = score;
        }
      }
    }
  }
  return best;
}

function phase3_benchmark(solver = solve_phase3_2gen) {
  let some_2gen_scrambles = [
    [
      0, 0, 0, 0, 1, 0, 0, 3, 1, 2, 1, 0, 1, 3, 1, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 1, 3, 3, 3, 5, 4, 5, 5, 4, 4, 4, 7, 6, 7, 7, 4, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 7, 4, 5, 4,
    ],
    [
      0, 3, 0, 1, 1, 1, 0, 1, 1, 2, 0, 3, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 3, 5, 4, 5, 4, 4, 5, 5, 7, 6, 7, 4, 4, 5, 5,
      7, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 4, 4,
    ],
    [
      2, 0, 3, 0, 1, 0, 0, 1, 0, 0, 3, 1, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 1, 0, 3, 7, 4, 5, 4, 5, 4, 4, 5, 4, 5, 7, 7, 5, 4,
      4, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 6, 7, 5, 4, 7,
    ],
    [
      3, 0, 3, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 3, 3, 1, 4, 4, 7, 7, 7, 5, 4, 7, 5, 7, 4, 4, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 6, 4, 5, 4, 4,
    ],
    [
      0, 0, 3, 3, 0, 0, 0, 1, 0, 3, 0, 0, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 1, 1, 0, 2, 7, 4, 5, 4, 4, 5, 4, 4, 7, 4, 5, 7, 5, 4,
      7, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 5, 4, 7, 4, 5,
    ],
    [
      1, 0, 0, 3, 0, 3, 0, 0, 3, 0, 0, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 3, 1, 1, 1, 5, 7, 4, 4, 5, 5, 4, 7, 4, 4, 4, 7, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 5, 4, 6,
    ],
    [
      0, 0, 0, 0, 3, 3, 3, 0, 3, 2, 0, 3, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 0, 5, 4, 4, 5, 4, 4, 4, 5, 7, 7, 7, 7, 5, 6,
      7, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 4, 4, 4,
    ],
    [
      1, 0, 0, 3, 0, 3, 1, 3, 1, 3, 0, 1, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 1, 0, 4, 4, 4, 4, 4, 4, 5, 5, 4, 6, 7, 5, 5, 5,
      7, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 7, 4, 4, 7, 5,
    ],
    [
      2, 3, 0, 1, 3, 3, 0, 1, 1, 0, 0, 0, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 3, 0, 1, 0, 7, 4, 7, 4, 6, 4, 5, 4, 4, 5, 4, 5, 5, 4,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 7, 5, 7, 4, 5,
    ],
    [
      3, 1, 1, 0, 1, 0, 3, 1, 0, 1, 0, 3, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 0, 0, 3, 3, 6, 4, 4, 7, 5, 4, 5, 7, 4, 4, 4, 5, 5, 5,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 7, 4, 4, 7,
    ],
    [
      0, 0, 0, 0, 3, 0, 1, 1, 3, 2, 3, 3, 1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 0, 0, 3, 0, 5, 4, 5, 4, 4, 7, 7, 4, 7, 7, 5, 7, 5, 6,
      5, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 4, 4,
    ],
    [
      1, 3, 3, 0, 0, 0, 1, 1, 3, 0, 0, 0, 1, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 3, 0, 0, 1, 5, 4, 4, 5, 5, 5, 7, 7, 4, 4, 4, 7, 5, 7,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 4, 6,
    ],
    [
      3, 0, 3, 3, 2, 3, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 0, 0, 1, 1, 6, 5, 4, 4, 7, 7, 7, 7, 5, 4, 4, 4, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 5, 4, 5, 4,
    ],
    [
      1, 0, 0, 0, 0, 1, 1, 1, 2, 3, 0, 3, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 3, 3, 0, 0, 4, 7, 4, 5, 5, 4, 4, 4, 5, 6, 4, 5, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 7, 4, 5, 7,
    ],
    [
      0, 0, 3, 3, 3, 3, 1, 0, 1, 3, 0, 0, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 1, 0, 1, 0, 7, 7, 4, 4, 5, 4, 4, 5, 4, 4, 5, 7, 5, 6,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 4, 7, 5,
    ],
    [
      3, 0, 0, 0, 1, 1, 0, 3, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 1, 3, 3, 3, 6, 4, 5, 4, 5, 4, 4, 4, 4, 4, 5, 4, 5, 5,
      7, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 7, 7, 7,
    ],
    [
      0, 0, 0, 1, 2, 3, 0, 1, 1, 3, 3, 1, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 3, 7, 4, 4, 4, 5, 7, 4, 4, 6, 4, 5, 5, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 5, 7, 4, 4,
    ],
    [
      0, 0, 3, 0, 0, 3, 3, 1, 0, 2, 0, 0, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 0, 1, 1, 1, 5, 5, 7, 7, 4, 5, 4, 7, 5, 7, 4, 4, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 4, 4, 4,
    ],
    [
      1, 1, 0, 0, 0, 3, 0, 0, 3, 3, 0, 3, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 1, 3, 0, 0, 4, 7, 7, 4, 7, 4, 4, 4, 7, 6, 4, 7, 5, 4,
      4, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 5, 5, 5, 5, 4,
    ],
    [
      1, 0, 3, 3, 2, 0, 0, 1, 3, 0, 1, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 5, 4, 5, 4, 6, 7, 7, 5, 7, 4, 5, 7, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 4, 4, 4, 4,
    ],
    [
      1, 0, 3, 0, 0, 0, 1, 3, 2, 3, 0, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 3, 1, 0, 4, 4, 4, 7, 5, 5, 4, 7, 5, 6, 5, 4, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 5, 7,
    ],
    [
      0, 3, 0, 1, 0, 3, 0, 1, 0, 2, 0, 0, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 1, 0, 0, 1, 5, 4, 7, 4, 4, 5, 5, 5, 5, 7, 4, 7, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 4, 4,
    ],
    [
      0, 3, 3, 0, 0, 1, 1, 3, 0, 2, 0, 0, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 0, 0, 1, 1, 5, 4, 5, 5, 4, 7, 7, 4, 5, 7, 4, 7, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 4, 4, 4,
    ],
    [
      1, 0, 1, 0, 0, 3, 1, 3, 3, 0, 0, 0, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 1, 3, 0, 1, 5, 5, 7, 4, 5, 5, 4, 4, 4, 4, 7, 7, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 4, 4, 6,
    ],
    [
      0, 3, 0, 0, 0, 1, 0, 3, 0, 2, 1, 1, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 0, 0, 0, 1, 5, 4, 5, 5, 4, 5, 4, 4, 5, 7, 4, 4, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 7, 4,
    ],
    [
      0, 0, 0, 1, 2, 0, 0, 3, 1, 3, 0, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 3, 3, 1, 3, 7, 4, 5, 4, 5, 7, 4, 5, 6, 4, 7, 4, 5, 7,
      4, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 4, 5, 7, 4,
    ],
    [
      1, 1, 1, 0, 0, 3, 0, 1, 2, 3, 3, 3, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 4, 4, 7, 4, 5, 4, 5, 5, 5, 6, 4, 4, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 5, 7,
    ],
    [
      0, 0, 0, 0, 0, 3, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 4, 7, 4, 5, 4, 4, 4, 7, 4, 5, 4, 7, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 5, 4, 5, 7,
    ],
    [
      2, 0, 1, 0, 1, 3, 3, 1, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 1, 0, 3, 7, 7, 4, 4, 5, 4, 4, 7, 4, 5, 5, 4, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 6, 5, 4, 7, 7,
    ],
    [
      3, 0, 0, 3, 1, 0, 0, 3, 0, 1, 1, 1, 1, 0, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 1, 0, 0, 3, 6, 4, 4, 4, 5, 5, 5, 4, 4, 4, 4, 4, 5, 5,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 7, 7, 7, 7,
    ],
    [
      3, 1, 3, 0, 0, 0, 3, 1, 3, 0, 0, 0, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 1, 0, 3, 1, 4, 4, 4, 7, 4, 5, 5, 7, 4, 7, 4, 4, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7, 5, 4, 7, 6,
    ],
    [
      0, 3, 0, 1, 1, 1, 0, 1, 1, 2, 0, 3, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 3, 3, 5, 4, 4, 4, 4, 7, 5, 4, 6, 7, 4, 5, 5, 5,
      7, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 7, 4, 4,
    ],
    [
      1, 0, 1, 1, 0, 3, 0, 3, 3, 0, 0, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 0, 3, 0, 1, 5, 4, 4, 4, 5, 4, 4, 7, 4, 4, 7, 5, 5, 7,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 5, 7, 6,
    ],
    [
      0, 1, 1, 3, 3, 0, 0, 3, 1, 1, 0, 1, 1, 2, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 0, 3, 4, 7, 4, 4, 7, 7, 5, 4, 6, 5, 4, 5, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 4, 4, 4,
    ],
    [
      0, 3, 0, 1, 3, 1, 0, 0, 2, 1, 0, 1, 1, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 3, 0, 3, 0, 4, 4, 4, 4, 7, 5, 5, 7, 5, 5, 4, 7, 5, 6,
      5, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 4, 7,
    ],
    [
      1, 1, 0, 0, 0, 0, 3, 1, 1, 3, 0, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 3, 0, 4, 4, 7, 7, 4, 4, 5, 4, 4, 6, 4, 5, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 4, 5, 5,
    ],
    [
      2, 1, 1, 3, 3, 3, 0, 0, 1, 0, 0, 0, 1, 3, 1, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 3, 0, 0, 0, 7, 4, 7, 4, 6, 7, 7, 4, 4, 5, 4, 5, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 7, 4, 5, 4, 5,
    ],
    [
      2, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 1, 1, 0, 3, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2,
      2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 1, 7, 5, 4, 4, 7, 4, 4, 7, 4, 5, 7, 7, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 4, 4, 5, 6,
    ],
    [
      3, 0, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 2, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 1, 0, 1, 4, 7, 4, 4, 7, 7, 4, 5, 5, 7, 4, 4, 5, 4,
      4, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 6, 5, 5, 7, 4,
    ],
    [
      1, 0, 1, 0, 0, 1, 0, 0, 3, 0, 1, 0, 1, 0, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 2, 3, 3, 0, 1, 5, 4, 4, 5, 5, 4, 4, 5, 4, 4, 7, 7, 5, 7,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 7, 6,
    ],
    [
      1, 3, 0, 0, 1, 3, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 1, 1, 0, 2, 5, 7, 5, 5, 4, 7, 4, 7, 7, 4, 4, 4, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 6, 4, 4, 4, 5,
    ],
    [
      3, 0, 1, 0, 1, 3, 0, 0, 2, 0, 3, 3, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 0, 1, 1, 0, 4, 4, 5, 5, 6, 7, 4, 4, 5, 7, 4, 5, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 7, 7,
    ],
    [
      0, 0, 0, 1, 1, 1, 0, 0, 1, 2, 0, 1, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 3, 3, 3, 3, 5, 5, 5, 4, 4, 7, 4, 7, 6, 7, 4, 4, 5, 5,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 7, 4, 4,
    ],
    [
      0, 1, 1, 0, 1, 3, 3, 0, 1, 2, 0, 0, 1, 3, 1, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 3, 3, 5, 5, 7, 4, 4, 7, 7, 5, 6, 7, 4, 4, 5, 5,
      5, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 4, 4,
    ],
    [
      1, 0, 1, 1, 2, 3, 3, 1, 3, 0, 0, 0, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 3, 0, 0, 0, 5, 4, 4, 4, 6, 4, 7, 7, 7, 4, 5, 5, 5, 7,
      5, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 5, 7, 4, 4, 4,
    ],
    [
      0, 0, 1, 0, 1, 1, 0, 0, 1, 2, 3, 0, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 3, 1, 0, 3, 5, 4, 5, 7, 4, 7, 4, 7, 6, 7, 5, 4, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 4, 5, 4,
    ],
    [
      3, 3, 0, 0, 3, 0, 1, 1, 0, 1, 0, 0, 1, 0, 3, 1, 1, 1, 2, 2, 2, 2, 0, 2, 2,
      2, 2, 3, 3, 3, 3, 1, 1, 0, 3, 2, 6, 4, 4, 5, 4, 5, 7, 4, 7, 4, 4, 7, 5, 4,
      5, 5, 5, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7, 4, 4, 7, 5,
    ],
    [
      1, 3, 3, 0, 0, 0, 0, 1, 1, 3, 1, 3, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 1, 0, 0, 0, 4, 4, 7, 7, 4, 4, 5, 7, 4, 6, 4, 5, 5, 5,
      4, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 7, 4, 4, 5, 5,
    ],
    [
      1, 0, 0, 0, 0, 3, 1, 0, 1, 3, 3, 3, 1, 3, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 1, 0, 1, 0, 4, 4, 4, 5, 4, 7, 4, 5, 4, 6, 7, 4, 5, 5,
      7, 5, 5, 5, 6, 6, 6, 6, 7, 6, 6, 6, 6, 7, 7, 7, 7, 7, 5, 4, 4, 5,
    ],
    [
      1, 0, 3, 3, 0, 0, 0, 3, 2, 3, 1, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 2, 2,
      2, 2, 3, 3, 3, 3, 0, 0, 0, 1, 0, 4, 4, 5, 4, 5, 7, 4, 4, 5, 6, 7, 4, 5, 7,
      7, 5, 5, 5, 6, 6, 6, 6, 4, 6, 6, 6, 6, 7, 7, 7, 7, 4, 5, 5, 4, 7,
    ],
  ];
  /* these fifty scrambles were obtained by doing a few hundred random LU moves */
  console.log("generating tables");
  let start = performance.now();
  solver(solved_state);
  console.log(performance.now() - start);
  let solve_times = [];
  let move_counts = [];
  console.log("solving");
  for (let scramble of some_2gen_scrambles) {
    let start = performance.now();
    let sol = solver(scramble);
    let elapsed = performance.now() - start;
    solve_times.push(elapsed);
    move_counts.push(sol.length);
    console.log(elapsed, sol.length);
    if (apply_move_sequence(scramble, sol).join("") !== solved_state.join("")) {
      console.log("solving failed!");
    }
  }
  console.log(
    `mean solve time: ${
      solve_times.reduce((x, y) => x + y) / some_2gen_scrambles.length
    }`,
  );
  console.log(
    `mean move count: ${
      move_counts.reduce((x, y) => x + y) / some_2gen_scrambles.length
    }`,
  );
  let sorted_solve_times = solve_times.slice().sort((x, y) => x - y);
  console.log(
    `1%/25%/50%/75%/99% solve times: ${sorted_solve_times[0]} ${
      sorted_solve_times[12]
    } ${(sorted_solve_times[24] + sorted_solve_times[25]) / 2} ${
      sorted_solve_times[37]
    } ${sorted_solve_times[49]}`,
  );
}

function solver_benchmark(solver = solve) {
  let some_scrambles = [
    [
      1, 1, 0, 3, 1, 1, 2, 3, 0, 2, 3, 1, 2, 0, 2, 0, 3, 0, 2, 0, 1, 1, 3, 0, 3,
      2, 2, 3, 0, 0, 1, 3, 2, 2, 3, 1, 6, 6, 5, 4, 7, 7, 7, 4, 5, 5, 5, 4, 5, 4,
      5, 7, 4, 7, 6, 5, 7, 4, 4, 6, 7, 5, 5, 7, 4, 7, 6, 6, 6, 6, 6, 4,
    ],
    [
      2, 3, 2, 2, 3, 2, 2, 0, 1, 0, 0, 3, 0, 1, 2, 2, 0, 3, 2, 1, 1, 3, 1, 3, 3,
      1, 0, 3, 1, 1, 0, 2, 0, 1, 3, 0, 7, 5, 6, 6, 6, 7, 6, 7, 4, 5, 4, 4, 4, 6,
      6, 6, 4, 7, 6, 4, 5, 7, 5, 5, 5, 7, 4, 7, 5, 5, 7, 4, 6, 7, 4, 5,
    ],
    [
      3, 0, 0, 0, 1, 3, 3, 0, 0, 1, 1, 2, 3, 3, 3, 3, 2, 0, 2, 0, 1, 1, 2, 3, 1,
      1, 1, 3, 2, 1, 2, 0, 2, 2, 0, 2, 6, 6, 4, 7, 4, 5, 6, 7, 7, 4, 5, 5, 4, 6,
      4, 5, 7, 5, 6, 5, 6, 4, 7, 7, 7, 4, 4, 7, 4, 6, 7, 5, 6, 6, 5, 5,
    ],
    [
      3, 0, 2, 2, 1, 0, 3, 2, 2, 0, 1, 3, 0, 1, 3, 1, 1, 3, 2, 3, 0, 2, 2, 3, 1,
      2, 1, 3, 0, 1, 2, 0, 0, 3, 1, 0, 4, 5, 7, 5, 5, 7, 7, 5, 5, 7, 7, 5, 4, 6,
      6, 6, 4, 4, 6, 5, 4, 7, 4, 6, 4, 4, 6, 7, 6, 7, 6, 5, 5, 4, 6, 7,
    ],
    [
      0, 1, 2, 0, 0, 3, 3, 0, 2, 3, 0, 0, 3, 0, 1, 2, 3, 3, 2, 1, 0, 3, 1, 1, 1,
      1, 1, 3, 2, 3, 2, 2, 2, 0, 2, 1, 7, 5, 4, 4, 5, 5, 7, 7, 6, 4, 6, 4, 4, 4,
      6, 4, 5, 4, 6, 5, 6, 6, 7, 7, 7, 6, 6, 7, 5, 7, 6, 5, 4, 7, 5, 5,
    ],
    [
      1, 3, 2, 1, 0, 2, 0, 0, 1, 3, 0, 3, 0, 0, 1, 2, 3, 0, 2, 3, 1, 1, 3, 1, 2,
      3, 1, 3, 1, 2, 2, 2, 0, 3, 0, 2, 4, 4, 5, 4, 5, 4, 7, 7, 5, 6, 6, 6, 7, 7,
      6, 7, 6, 5, 6, 6, 7, 5, 7, 4, 5, 5, 4, 7, 4, 4, 6, 4, 7, 5, 5, 6,
    ],
    [
      2, 2, 1, 2, 0, 0, 0, 3, 2, 0, 0, 0, 3, 1, 0, 3, 3, 3, 2, 2, 1, 1, 3, 3, 1,
      2, 1, 3, 1, 2, 0, 0, 2, 3, 1, 1, 7, 4, 7, 5, 5, 5, 7, 6, 6, 5, 7, 6, 4, 7,
      7, 4, 7, 4, 6, 5, 5, 6, 4, 4, 6, 4, 6, 7, 6, 4, 7, 4, 5, 5, 6, 5,
    ],
    [
      1, 2, 1, 0, 1, 1, 0, 3, 0, 3, 2, 3, 2, 1, 2, 3, 0, 3, 2, 1, 1, 1, 0, 0, 3,
      3, 0, 3, 3, 0, 0, 2, 2, 1, 2, 2, 4, 6, 7, 4, 6, 6, 5, 7, 7, 6, 5, 5, 7, 5,
      4, 6, 5, 7, 6, 4, 7, 6, 5, 4, 7, 5, 4, 7, 4, 4, 7, 4, 6, 5, 6, 5,
    ],
    [
      0, 1, 2, 1, 2, 1, 0, 0, 1, 3, 2, 3, 3, 2, 0, 1, 1, 0, 2, 3, 1, 0, 1, 2, 3,
      3, 1, 3, 0, 0, 2, 0, 2, 2, 3, 3, 7, 5, 7, 6, 7, 5, 7, 7, 6, 4, 5, 4, 4, 5,
      4, 7, 4, 5, 6, 7, 5, 4, 5, 5, 4, 6, 4, 7, 6, 6, 6, 6, 6, 5, 7, 4,
    ],
    [
      1, 0, 2, 2, 0, 3, 3, 2, 0, 3, 1, 0, 0, 1, 0, 3, 1, 0, 2, 1, 3, 0, 3, 1, 1,
      3, 2, 3, 2, 1, 2, 2, 0, 3, 2, 1, 4, 5, 4, 5, 6, 7, 7, 5, 5, 6, 5, 5, 7, 7,
      7, 4, 7, 7, 6, 6, 4, 4, 5, 4, 6, 6, 5, 7, 6, 6, 7, 4, 5, 4, 6, 4,
    ],
    [
      3, 0, 1, 2, 0, 3, 3, 1, 1, 1, 1, 2, 2, 2, 0, 0, 0, 0, 2, 1, 3, 1, 3, 1, 0,
      3, 1, 3, 3, 2, 2, 0, 0, 3, 2, 2, 6, 6, 6, 7, 7, 5, 6, 4, 5, 4, 7, 5, 6, 7,
      6, 5, 4, 5, 6, 7, 4, 4, 5, 7, 4, 7, 4, 7, 5, 7, 5, 4, 6, 4, 5, 6,
    ],
    [
      1, 0, 3, 1, 1, 0, 3, 2, 2, 3, 2, 3, 3, 0, 1, 3, 0, 0, 2, 0, 3, 2, 0, 1, 1,
      1, 2, 3, 2, 2, 1, 3, 0, 0, 2, 1, 4, 6, 7, 6, 7, 6, 4, 5, 6, 6, 5, 5, 7, 5,
      5, 5, 4, 7, 6, 5, 4, 7, 4, 4, 6, 7, 5, 7, 7, 7, 4, 4, 6, 4, 6, 5,
    ],
    [
      3, 3, 2, 3, 1, 2, 0, 0, 2, 0, 0, 1, 0, 2, 1, 1, 0, 1, 2, 2, 3, 1, 3, 1, 2,
      0, 0, 3, 2, 3, 1, 1, 3, 3, 2, 0, 4, 5, 6, 7, 5, 4, 6, 6, 5, 7, 4, 7, 7, 4,
      4, 6, 7, 4, 6, 7, 7, 6, 6, 6, 4, 5, 5, 7, 5, 5, 5, 6, 5, 4, 4, 7,
    ],
    [
      0, 1, 0, 3, 3, 3, 0, 1, 0, 3, 1, 2, 3, 1, 0, 2, 1, 1, 2, 0, 3, 2, 1, 0, 3,
      2, 0, 3, 2, 3, 1, 2, 2, 0, 1, 2, 7, 6, 4, 6, 6, 6, 7, 5, 7, 4, 5, 6, 7, 6,
      7, 4, 5, 4, 6, 5, 7, 7, 5, 7, 6, 5, 5, 7, 5, 4, 4, 4, 4, 4, 6, 5,
    ],
    [
      2, 3, 2, 2, 0, 1, 1, 0, 3, 0, 0, 3, 3, 2, 2, 3, 0, 1, 2, 0, 1, 1, 3, 3, 2,
      3, 0, 3, 2, 0, 1, 1, 2, 0, 1, 1, 7, 5, 6, 7, 5, 5, 7, 7, 4, 5, 4, 7, 6, 7,
      4, 6, 4, 4, 6, 5, 4, 4, 6, 6, 7, 7, 5, 7, 4, 5, 5, 4, 5, 6, 6, 6,
    ],
    [
      0, 2, 1, 1, 1, 0, 0, 1, 1, 2, 1, 3, 2, 0, 2, 3, 3, 0, 2, 2, 2, 3, 2, 0, 1,
      3, 3, 3, 0, 1, 3, 1, 2, 0, 0, 3, 5, 5, 7, 4, 4, 6, 4, 5, 6, 7, 7, 6, 6, 6,
      7, 6, 6, 4, 6, 7, 4, 4, 5, 4, 7, 7, 7, 7, 5, 5, 6, 5, 4, 5, 5, 4,
    ],
    [
      3, 1, 3, 2, 1, 1, 3, 0, 0, 0, 1, 0, 2, 1, 3, 3, 1, 1, 2, 3, 3, 1, 2, 0, 0,
      2, 3, 3, 0, 2, 2, 0, 2, 0, 1, 2, 4, 6, 5, 5, 5, 4, 7, 5, 7, 7, 5, 4, 6, 6,
      7, 4, 4, 6, 6, 5, 5, 4, 4, 7, 7, 7, 4, 7, 4, 6, 7, 5, 6, 6, 6, 5,
    ],
    [
      0, 0, 1, 2, 0, 0, 1, 3, 2, 2, 2, 3, 1, 0, 0, 3, 1, 3, 2, 0, 0, 3, 3, 2, 3,
      1, 1, 3, 0, 3, 1, 1, 2, 2, 2, 1, 5, 5, 5, 7, 4, 7, 6, 4, 6, 7, 7, 5, 4, 7,
      6, 7, 6, 4, 6, 5, 7, 6, 5, 4, 4, 4, 6, 7, 4, 6, 6, 4, 5, 5, 7, 5,
    ],
    [
      3, 3, 3, 3, 1, 3, 0, 1, 0, 1, 0, 0, 2, 0, 3, 1, 0, 1, 2, 1, 2, 1, 2, 2, 3,
      0, 0, 3, 0, 1, 2, 3, 2, 2, 1, 2, 6, 5, 5, 7, 7, 5, 7, 7, 7, 4, 4, 4, 5, 6,
      6, 6, 5, 4, 6, 7, 7, 5, 4, 6, 4, 4, 5, 7, 6, 4, 6, 5, 7, 4, 6, 5,
    ],
    [
      0, 1, 3, 2, 1, 2, 2, 3, 1, 3, 3, 2, 1, 0, 1, 0, 3, 3, 2, 3, 1, 0, 0, 1, 3,
      0, 1, 3, 0, 0, 1, 2, 0, 2, 2, 2, 7, 7, 7, 5, 5, 5, 6, 6, 5, 4, 4, 4, 6, 5,
      4, 6, 6, 4, 6, 4, 6, 5, 7, 7, 7, 4, 6, 7, 4, 7, 5, 4, 5, 7, 5, 6,
    ],
    [
      3, 2, 3, 1, 0, 2, 2, 3, 1, 1, 2, 0, 0, 0, 1, 0, 2, 1, 2, 3, 3, 3, 3, 1, 3,
      0, 0, 3, 1, 2, 1, 2, 0, 0, 1, 2, 6, 6, 5, 5, 5, 4, 5, 7, 5, 4, 5, 7, 7, 7,
      6, 4, 6, 4, 6, 6, 4, 6, 7, 5, 4, 6, 5, 7, 7, 5, 4, 4, 7, 7, 4, 6,
    ],
    [
      2, 2, 3, 1, 3, 3, 1, 0, 1, 1, 3, 0, 1, 1, 2, 2, 1, 2, 2, 0, 1, 3, 0, 3, 3,
      2, 0, 3, 0, 2, 0, 0, 0, 2, 1, 3, 5, 4, 4, 5, 5, 6, 7, 7, 6, 6, 5, 5, 4, 4,
      4, 6, 6, 5, 6, 7, 5, 7, 4, 7, 6, 6, 7, 7, 4, 5, 5, 7, 7, 6, 4, 4,
    ],
    [
      3, 2, 0, 1, 1, 2, 3, 3, 3, 0, 3, 1, 0, 0, 3, 0, 1, 0, 2, 1, 0, 3, 2, 0, 0,
      3, 1, 3, 1, 2, 2, 2, 2, 2, 1, 1, 4, 7, 5, 5, 5, 7, 7, 7, 4, 7, 6, 6, 7, 6,
      4, 5, 4, 5, 6, 4, 7, 6, 7, 6, 4, 5, 4, 7, 6, 4, 5, 5, 6, 4, 5, 6,
    ],
    [
      3, 1, 3, 3, 3, 2, 0, 3, 2, 1, 1, 0, 3, 2, 2, 2, 3, 0, 2, 0, 1, 1, 0, 0, 2,
      1, 1, 3, 3, 2, 0, 0, 0, 2, 1, 1, 6, 5, 7, 4, 7, 5, 7, 4, 6, 4, 6, 4, 6, 4,
      7, 6, 5, 5, 6, 7, 6, 4, 5, 7, 5, 5, 4, 7, 7, 4, 5, 7, 6, 4, 6, 5,
    ],
    [
      3, 2, 1, 2, 2, 1, 0, 2, 0, 1, 1, 3, 0, 3, 3, 3, 1, 1, 2, 0, 0, 1, 1, 0, 3,
      2, 0, 3, 1, 2, 2, 0, 3, 3, 0, 2, 6, 6, 6, 5, 4, 7, 7, 7, 7, 4, 6, 6, 7, 5,
      7, 6, 6, 4, 6, 4, 4, 5, 7, 4, 4, 5, 5, 7, 4, 5, 7, 6, 5, 5, 4, 5,
    ],
    [
      0, 1, 2, 3, 1, 2, 2, 3, 2, 3, 1, 0, 1, 0, 3, 2, 1, 1, 2, 0, 2, 0, 0, 0, 3,
      3, 3, 3, 3, 1, 0, 2, 1, 2, 0, 1, 7, 5, 6, 4, 5, 5, 7, 7, 6, 4, 4, 6, 6, 5,
      7, 6, 4, 6, 6, 7, 5, 5, 7, 4, 6, 7, 4, 7, 7, 5, 4, 4, 6, 5, 4, 5,
    ],
    [
      1, 3, 3, 0, 2, 1, 3, 0, 1, 3, 0, 1, 2, 2, 3, 2, 3, 3, 2, 0, 2, 1, 1, 0, 1,
      1, 0, 3, 3, 2, 1, 0, 2, 2, 0, 0, 4, 4, 6, 7, 7, 7, 7, 4, 4, 6, 6, 7, 6, 5,
      4, 4, 6, 7, 6, 4, 7, 6, 5, 5, 5, 5, 4, 7, 5, 6, 5, 6, 5, 7, 4, 5,
    ],
    [
      2, 2, 2, 2, 2, 1, 3, 0, 3, 0, 3, 0, 2, 1, 0, 0, 1, 0, 2, 3, 3, 1, 1, 3, 1,
      2, 3, 3, 0, 1, 0, 0, 3, 1, 2, 1, 7, 4, 7, 6, 5, 5, 6, 6, 4, 5, 5, 7, 7, 5,
      5, 4, 6, 4, 6, 4, 4, 5, 4, 4, 7, 7, 7, 7, 6, 6, 5, 6, 5, 7, 4, 6,
    ],
    [
      0, 3, 2, 1, 0, 3, 0, 3, 1, 3, 3, 3, 1, 1, 0, 0, 1, 0, 2, 1, 2, 3, 1, 2, 2,
      0, 2, 3, 0, 0, 2, 2, 1, 2, 1, 3, 7, 4, 6, 4, 6, 5, 5, 5, 6, 4, 7, 4, 6, 4,
      7, 6, 6, 7, 6, 4, 5, 6, 5, 7, 7, 7, 5, 7, 5, 4, 7, 5, 4, 5, 6, 4,
    ],
    [
      1, 1, 0, 2, 0, 1, 0, 1, 3, 2, 0, 2, 3, 1, 1, 3, 3, 0, 2, 2, 3, 0, 3, 2, 3,
      0, 2, 3, 1, 0, 2, 0, 2, 1, 3, 1, 6, 7, 5, 5, 5, 4, 4, 7, 4, 5, 6, 7, 4, 7,
      6, 6, 7, 7, 6, 5, 6, 5, 4, 6, 7, 5, 5, 7, 6, 4, 7, 4, 4, 4, 5, 6,
    ],
    [
      3, 1, 0, 2, 1, 2, 1, 0, 2, 1, 3, 1, 2, 2, 0, 2, 2, 0, 2, 0, 1, 3, 0, 3, 0,
      3, 3, 3, 0, 2, 3, 1, 3, 1, 1, 0, 6, 7, 5, 6, 5, 5, 5, 7, 5, 4, 4, 6, 5, 5,
      6, 4, 5, 4, 6, 7, 4, 4, 6, 7, 7, 7, 7, 7, 5, 4, 6, 4, 4, 6, 6, 7,
    ],
    [
      2, 3, 3, 1, 1, 2, 0, 1, 1, 0, 3, 0, 1, 3, 3, 0, 0, 3, 2, 0, 0, 2, 2, 1, 2,
      2, 1, 3, 3, 2, 2, 0, 3, 1, 1, 0, 7, 6, 7, 6, 4, 6, 5, 6, 4, 5, 4, 5, 4, 6,
      4, 7, 5, 4, 6, 7, 5, 5, 7, 6, 7, 4, 6, 7, 5, 7, 6, 5, 4, 4, 7, 5,
    ],
    [
      0, 1, 2, 2, 1, 0, 3, 1, 2, 2, 2, 0, 0, 3, 0, 3, 3, 0, 2, 1, 3, 0, 3, 1, 0,
      2, 1, 3, 3, 1, 2, 0, 2, 1, 3, 1, 5, 5, 7, 7, 4, 5, 5, 5, 6, 7, 4, 5, 5, 4,
      6, 7, 4, 5, 6, 4, 4, 4, 7, 6, 7, 7, 4, 7, 6, 4, 6, 6, 7, 6, 6, 5,
    ],
    [
      0, 0, 3, 2, 0, 1, 3, 0, 1, 2, 0, 0, 3, 0, 2, 0, 3, 1, 2, 1, 0, 2, 3, 1, 1,
      3, 3, 3, 2, 2, 3, 1, 2, 1, 1, 2, 5, 5, 7, 7, 4, 6, 5, 6, 5, 7, 7, 5, 6, 7,
      4, 4, 5, 6, 6, 6, 7, 5, 5, 7, 4, 4, 4, 7, 6, 6, 4, 4, 4, 7, 5, 6,
    ],
    [
      2, 2, 2, 2, 3, 3, 1, 3, 0, 1, 1, 2, 0, 3, 0, 3, 1, 2, 2, 1, 1, 0, 1, 3, 3,
      2, 0, 3, 2, 1, 3, 0, 0, 0, 0, 1, 5, 5, 7, 5, 4, 7, 7, 5, 5, 6, 7, 6, 5, 6,
      6, 7, 4, 5, 6, 6, 7, 4, 7, 4, 4, 5, 7, 7, 6, 4, 6, 4, 6, 4, 5, 4,
    ],
    [
      0, 1, 3, 2, 1, 0, 0, 2, 2, 3, 1, 1, 3, 2, 3, 3, 0, 3, 2, 3, 1, 1, 0, 3, 0,
      2, 1, 3, 0, 0, 2, 0, 1, 2, 2, 1, 7, 5, 4, 7, 7, 5, 6, 6, 6, 4, 4, 4, 4, 5,
      5, 4, 7, 4, 6, 7, 6, 6, 5, 4, 6, 7, 6, 7, 7, 7, 5, 4, 6, 5, 5, 5,
    ],
    [
      2, 0, 0, 1, 0, 3, 2, 3, 1, 0, 2, 2, 3, 1, 0, 1, 0, 1, 2, 3, 1, 0, 3, 1, 3,
      2, 0, 3, 0, 1, 1, 2, 3, 2, 2, 3, 7, 6, 4, 6, 6, 7, 7, 5, 6, 5, 5, 6, 4, 7,
      6, 6, 5, 4, 6, 4, 5, 7, 5, 4, 5, 6, 5, 7, 7, 7, 4, 4, 7, 5, 4, 4,
    ],
    [
      3, 3, 2, 3, 2, 3, 0, 2, 0, 1, 0, 0, 1, 2, 0, 0, 1, 3, 2, 3, 3, 2, 1, 3, 1,
      0, 0, 3, 2, 1, 2, 0, 2, 1, 1, 1, 6, 7, 6, 6, 7, 6, 5, 4, 5, 4, 7, 5, 6, 5,
      7, 4, 7, 7, 6, 5, 4, 7, 5, 5, 5, 7, 4, 7, 4, 5, 6, 6, 6, 4, 4, 4,
    ],
    [
      3, 3, 3, 1, 0, 1, 0, 2, 2, 0, 2, 3, 1, 2, 0, 3, 2, 3, 2, 2, 3, 0, 1, 1, 2,
      2, 1, 3, 0, 0, 3, 0, 1, 1, 0, 1, 4, 5, 6, 5, 7, 7, 6, 5, 6, 7, 4, 7, 4, 4,
      5, 7, 6, 4, 6, 7, 4, 4, 5, 5, 7, 4, 6, 7, 6, 4, 6, 5, 6, 5, 7, 5,
    ],
    [
      0, 1, 3, 3, 1, 0, 0, 1, 2, 3, 2, 2, 0, 1, 1, 1, 3, 0, 2, 0, 2, 3, 3, 2, 2,
      1, 2, 3, 3, 0, 1, 0, 3, 2, 0, 1, 7, 5, 4, 6, 5, 5, 7, 6, 6, 4, 6, 7, 5, 4,
      6, 6, 5, 7, 6, 4, 5, 7, 4, 7, 4, 4, 5, 7, 7, 7, 5, 6, 6, 4, 4, 5,
    ],
    [
      0, 0, 3, 2, 2, 2, 3, 0, 2, 3, 0, 0, 1, 0, 0, 3, 2, 1, 2, 1, 1, 0, 1, 2, 1,
      3, 3, 3, 2, 3, 2, 1, 1, 3, 1, 0, 7, 4, 5, 5, 4, 5, 7, 7, 5, 4, 7, 6, 4, 5,
      4, 5, 4, 6, 6, 6, 6, 5, 5, 6, 6, 7, 4, 7, 6, 7, 7, 6, 4, 4, 5, 7,
    ],
    [
      1, 3, 1, 1, 0, 3, 1, 1, 1, 3, 2, 2, 2, 2, 2, 0, 2, 1, 2, 0, 1, 1, 3, 0, 3,
      0, 0, 3, 0, 3, 3, 0, 3, 2, 0, 2, 4, 7, 6, 6, 7, 4, 5, 7, 5, 6, 7, 4, 6, 7,
      6, 6, 5, 4, 6, 5, 7, 4, 5, 5, 7, 6, 5, 7, 4, 7, 4, 4, 4, 5, 5, 6,
    ],
    [
      2, 0, 1, 2, 1, 3, 1, 0, 1, 0, 3, 3, 0, 3, 2, 2, 0, 0, 2, 3, 0, 2, 3, 2, 3,
      1, 1, 3, 0, 3, 1, 0, 2, 1, 1, 2, 7, 7, 4, 5, 4, 6, 5, 4, 5, 5, 7, 4, 4, 4,
      5, 4, 5, 5, 6, 5, 7, 7, 7, 7, 6, 6, 4, 7, 6, 7, 6, 6, 5, 4, 6, 6,
    ],
    [
      3, 0, 0, 2, 1, 3, 2, 1, 1, 0, 0, 0, 3, 0, 1, 1, 2, 1, 2, 3, 0, 3, 0, 1, 2,
      3, 3, 3, 0, 3, 1, 2, 2, 1, 2, 2, 4, 4, 5, 5, 5, 4, 6, 6, 5, 7, 5, 7, 6, 5,
      6, 6, 6, 6, 6, 7, 7, 7, 7, 4, 4, 5, 4, 7, 4, 7, 5, 4, 5, 7, 4, 6,
    ],
    [
      2, 3, 0, 2, 1, 3, 3, 2, 0, 1, 2, 2, 0, 3, 0, 0, 3, 3, 2, 1, 3, 1, 0, 1, 1,
      1, 1, 3, 2, 2, 3, 0, 1, 0, 0, 2, 5, 6, 7, 5, 4, 6, 5, 4, 7, 6, 4, 4, 4, 5,
      7, 6, 7, 4, 6, 7, 4, 5, 7, 5, 7, 6, 6, 7, 4, 6, 6, 4, 5, 7, 5, 5,
    ],
    [
      3, 0, 2, 2, 2, 0, 3, 3, 1, 1, 0, 1, 2, 0, 2, 0, 3, 3, 2, 3, 0, 1, 1, 3, 3,
      2, 0, 3, 1, 0, 1, 2, 1, 2, 1, 0, 6, 4, 7, 7, 5, 5, 5, 7, 4, 4, 7, 6, 6, 5,
      5, 7, 4, 7, 6, 5, 6, 6, 7, 4, 5, 5, 4, 7, 4, 4, 4, 6, 6, 6, 7, 5,
    ],
    [
      1, 0, 3, 1, 3, 2, 1, 3, 0, 2, 3, 0, 0, 1, 3, 3, 1, 0, 2, 0, 1, 3, 1, 1, 1,
      0, 3, 3, 2, 2, 2, 0, 0, 2, 2, 2, 6, 6, 7, 4, 5, 4, 5, 5, 7, 5, 7, 4, 5, 6,
      5, 5, 6, 4, 6, 7, 7, 4, 4, 4, 7, 6, 7, 7, 4, 7, 6, 4, 5, 6, 6, 5,
    ],
    [
      1, 1, 2, 2, 2, 2, 1, 3, 0, 3, 2, 0, 3, 2, 3, 0, 0, 0, 2, 3, 1, 0, 1, 1, 2,
      0, 3, 3, 3, 1, 0, 0, 3, 1, 2, 1, 4, 6, 5, 5, 7, 7, 6, 5, 5, 6, 4, 6, 4, 5,
      7, 7, 4, 4, 6, 7, 4, 5, 5, 4, 4, 6, 7, 7, 6, 6, 7, 6, 7, 5, 5, 4,
    ],
    [
      0, 3, 0, 2, 1, 1, 1, 2, 1, 3, 3, 2, 2, 0, 0, 0, 3, 0, 2, 1, 1, 3, 3, 0, 0,
      3, 2, 3, 2, 1, 0, 1, 3, 1, 2, 2, 7, 7, 5, 6, 4, 6, 6, 5, 5, 4, 6, 7, 5, 4,
      6, 5, 4, 7, 6, 7, 4, 4, 5, 7, 4, 7, 5, 7, 4, 6, 7, 6, 5, 5, 4, 6,
    ],
    [
      0, 2, 0, 3, 2, 3, 1, 2, 1, 3, 1, 0, 3, 2, 1, 2, 0, 0, 2, 1, 2, 0, 1, 2, 3,
      3, 1, 3, 0, 1, 0, 0, 3, 2, 1, 3, 7, 5, 5, 6, 7, 4, 5, 4, 6, 4, 7, 5, 4, 5,
      6, 7, 6, 5, 6, 7, 5, 5, 5, 7, 6, 6, 4, 7, 6, 4, 4, 6, 7, 4, 7, 4,
    ],
    [
      2, 2, 0, 2, 0, 2, 2, 3, 3, 1, 0, 0, 1, 2, 3, 0, 1, 3, 2, 0, 2, 3, 1, 1, 3,
      2, 0, 3, 1, 0, 1, 0, 3, 3, 1, 1, 5, 4, 6, 6, 7, 5, 7, 6, 4, 6, 5, 7, 4, 4,
      7, 6, 7, 7, 6, 6, 4, 4, 5, 5, 7, 5, 4, 7, 5, 6, 5, 5, 4, 7, 4, 6,
    ],
    [
      3, 2, 2, 1, 3, 1, 3, 3, 2, 1, 3, 2, 1, 2, 0, 0, 3, 0, 2, 1, 0, 0, 0, 3, 3,
      0, 1, 3, 2, 1, 0, 0, 1, 2, 2, 1, 6, 4, 7, 5, 7, 6, 6, 5, 6, 4, 5, 5, 4, 4,
      7, 6, 7, 5, 6, 7, 4, 4, 5, 4, 7, 5, 4, 7, 6, 6, 5, 7, 4, 7, 6, 5,
    ],
    [
      0, 0, 2, 1, 1, 3, 2, 1, 2, 2, 2, 3, 2, 0, 1, 3, 3, 1, 2, 1, 0, 0, 3, 2, 3,
      0, 0, 3, 0, 0, 3, 3, 1, 1, 2, 1, 5, 5, 7, 6, 7, 6, 4, 7, 6, 7, 7, 5, 6, 4,
      5, 6, 4, 4, 6, 4, 4, 5, 4, 7, 7, 5, 5, 7, 5, 6, 4, 6, 6, 7, 4, 5,
    ],
    [
      1, 3, 2, 1, 2, 2, 3, 0, 0, 3, 2, 3, 2, 2, 1, 1, 3, 0, 2, 0, 0, 0, 1, 2, 3,
      3, 3, 3, 2, 1, 1, 0, 0, 0, 1, 1, 4, 7, 6, 6, 7, 6, 4, 4, 5, 6, 7, 7, 6, 5,
      5, 4, 4, 4, 6, 5, 6, 7, 5, 7, 5, 5, 7, 7, 5, 7, 4, 6, 4, 6, 5, 4,
    ],
    [
      0, 1, 3, 2, 2, 2, 3, 1, 2, 3, 0, 3, 0, 1, 0, 0, 2, 3, 2, 1, 2, 3, 1, 3, 2,
      1, 1, 3, 2, 1, 1, 0, 0, 3, 0, 0, 7, 7, 5, 6, 5, 7, 6, 4, 5, 4, 4, 6, 5, 5,
      4, 7, 6, 4, 6, 5, 5, 7, 4, 5, 4, 7, 6, 7, 5, 6, 6, 6, 4, 4, 7, 7,
    ],
    [
      0, 2, 1, 2, 1, 1, 2, 3, 1, 3, 0, 0, 1, 0, 2, 0, 3, 0, 2, 3, 3, 3, 2, 1, 3,
      0, 1, 3, 1, 0, 1, 2, 2, 0, 2, 3, 7, 7, 4, 7, 5, 4, 4, 6, 6, 4, 6, 5, 6, 6,
      6, 6, 6, 5, 6, 5, 7, 7, 7, 5, 5, 7, 4, 7, 4, 7, 4, 5, 4, 5, 5, 4,
    ],
    [
      0, 2, 3, 0, 1, 2, 0, 1, 1, 3, 1, 0, 1, 2, 2, 0, 0, 0, 2, 1, 3, 3, 0, 1, 2,
      1, 2, 3, 2, 0, 3, 1, 2, 3, 3, 3, 7, 5, 6, 4, 5, 7, 6, 4, 6, 4, 6, 5, 6, 5,
      6, 7, 4, 7, 6, 5, 4, 7, 6, 5, 7, 7, 5, 7, 4, 5, 4, 4, 6, 5, 7, 4,
    ],
    [
      1, 0, 2, 1, 2, 3, 1, 1, 0, 3, 2, 0, 3, 0, 3, 3, 0, 3, 2, 3, 2, 2, 1, 3, 0,
      1, 0, 3, 2, 0, 1, 2, 2, 0, 1, 1, 4, 6, 7, 6, 5, 6, 5, 7, 5, 6, 7, 7, 4, 5,
      6, 4, 5, 7, 6, 5, 5, 7, 7, 4, 7, 4, 4, 7, 6, 6, 4, 6, 5, 5, 4, 4,
    ],
    [
      1, 2, 3, 3, 2, 3, 1, 0, 1, 3, 2, 0, 1, 2, 2, 0, 3, 3, 2, 3, 0, 2, 1, 2, 0,
      1, 0, 3, 0, 1, 1, 0, 1, 3, 2, 0, 4, 6, 7, 6, 7, 5, 7, 4, 4, 6, 7, 7, 4, 5,
      4, 5, 7, 7, 6, 4, 4, 5, 5, 5, 7, 6, 4, 7, 4, 6, 6, 6, 6, 5, 5, 5,
    ],
    [
      1, 1, 1, 3, 0, 1, 2, 3, 1, 3, 1, 0, 3, 1, 2, 0, 2, 2, 2, 2, 3, 0, 3, 0, 1,
      3, 0, 3, 2, 2, 3, 2, 0, 0, 1, 0, 4, 6, 4, 6, 6, 4, 4, 7, 4, 6, 4, 6, 7, 7,
      6, 5, 5, 5, 6, 7, 7, 5, 5, 5, 7, 6, 7, 7, 5, 5, 4, 4, 4, 6, 7, 5,
    ],
    [
      2, 0, 1, 3, 1, 2, 2, 0, 1, 0, 1, 0, 3, 1, 3, 3, 3, 0, 2, 0, 1, 2, 3, 0, 1,
      2, 3, 3, 2, 2, 1, 2, 3, 0, 1, 0, 7, 6, 5, 7, 6, 4, 7, 7, 4, 5, 5, 7, 6, 4,
      4, 5, 4, 4, 6, 6, 5, 7, 5, 6, 4, 6, 7, 7, 4, 7, 4, 6, 5, 5, 6, 5,
    ],
    [
      3, 2, 2, 0, 2, 3, 3, 2, 0, 1, 1, 0, 3, 0, 0, 2, 2, 0, 2, 0, 0, 3, 1, 3, 0,
      3, 1, 3, 1, 1, 1, 3, 1, 2, 1, 2, 6, 5, 6, 4, 7, 5, 5, 5, 7, 4, 6, 7, 4, 5,
      6, 7, 5, 5, 6, 6, 7, 7, 4, 4, 7, 4, 4, 7, 5, 6, 4, 6, 4, 6, 7, 5,
    ],
    [
      0, 2, 3, 0, 0, 0, 1, 0, 1, 3, 3, 1, 2, 2, 2, 2, 1, 3, 2, 3, 1, 1, 1, 3, 1,
      2, 1, 3, 0, 0, 3, 0, 2, 0, 3, 2, 7, 4, 6, 7, 7, 4, 5, 7, 5, 4, 5, 6, 6, 4,
      5, 5, 6, 4, 6, 4, 5, 4, 5, 7, 7, 4, 6, 7, 7, 5, 6, 5, 4, 6, 7, 6,
    ],
    [
      2, 1, 2, 2, 0, 1, 3, 1, 1, 0, 1, 0, 0, 0, 0, 0, 3, 3, 2, 1, 1, 3, 3, 2, 0,
      3, 1, 3, 3, 0, 2, 1, 3, 2, 2, 2, 7, 6, 7, 7, 4, 5, 5, 7, 5, 5, 4, 4, 4, 7,
      4, 5, 6, 4, 6, 4, 7, 6, 5, 4, 7, 5, 6, 7, 5, 5, 6, 4, 6, 7, 6, 6,
    ],
    [
      3, 1, 3, 2, 3, 0, 3, 3, 2, 0, 0, 0, 2, 0, 2, 3, 1, 2, 2, 1, 3, 0, 1, 2, 3,
      1, 0, 3, 1, 0, 2, 1, 1, 0, 2, 1, 4, 7, 4, 6, 4, 6, 5, 5, 6, 7, 5, 5, 5, 6,
      4, 7, 6, 5, 6, 4, 5, 4, 5, 7, 6, 7, 7, 7, 6, 7, 7, 4, 6, 4, 4, 5,
    ],
    [
      1, 2, 3, 0, 3, 1, 2, 1, 0, 2, 1, 0, 3, 2, 2, 2, 0, 1, 2, 1, 2, 1, 0, 3, 3,
      1, 3, 3, 0, 3, 3, 0, 2, 0, 0, 1, 6, 6, 7, 4, 7, 7, 7, 4, 5, 5, 6, 6, 4, 4,
      7, 7, 5, 6, 6, 5, 6, 4, 5, 4, 7, 5, 4, 7, 5, 6, 6, 7, 4, 5, 5, 4,
    ],
    [
      0, 1, 1, 3, 3, 0, 2, 0, 2, 3, 2, 0, 0, 0, 3, 3, 2, 0, 2, 1, 2, 3, 1, 1, 0,
      1, 2, 3, 2, 3, 0, 1, 3, 1, 2, 1, 7, 5, 6, 6, 4, 7, 5, 5, 6, 4, 6, 6, 5, 6,
      4, 7, 5, 7, 6, 7, 7, 7, 5, 4, 4, 5, 5, 7, 4, 6, 4, 4, 7, 6, 4, 5,
    ],
    [
      3, 2, 3, 1, 0, 2, 1, 1, 0, 1, 1, 3, 3, 1, 2, 3, 0, 3, 2, 0, 1, 0, 1, 0, 3,
      3, 0, 3, 0, 0, 2, 2, 1, 2, 2, 2, 6, 6, 6, 5, 6, 6, 7, 5, 7, 4, 6, 6, 4, 4,
      4, 6, 7, 7, 6, 4, 5, 5, 5, 7, 7, 7, 4, 7, 7, 4, 5, 5, 4, 4, 5, 5,
    ],
    [
      1, 1, 2, 2, 2, 3, 3, 2, 0, 3, 2, 1, 1, 2, 1, 0, 0, 0, 2, 3, 1, 1, 1, 0, 2,
      3, 3, 3, 0, 0, 3, 0, 3, 0, 2, 1, 4, 7, 7, 5, 7, 6, 5, 5, 5, 6, 5, 4, 4, 5,
      4, 6, 7, 4, 6, 4, 5, 6, 5, 7, 7, 5, 7, 7, 7, 6, 4, 6, 4, 6, 6, 4,
    ],
    [
      0, 2, 1, 2, 1, 3, 1, 1, 1, 2, 1, 2, 2, 3, 2, 3, 1, 1, 2, 0, 0, 1, 2, 3, 0,
      3, 3, 3, 3, 2, 0, 0, 0, 3, 0, 0, 5, 5, 6, 6, 4, 6, 7, 7, 4, 7, 7, 4, 5, 6,
      4, 7, 4, 6, 6, 4, 7, 4, 7, 5, 6, 7, 4, 7, 5, 5, 4, 5, 5, 6, 6, 5,
    ],
    [
      3, 2, 1, 3, 3, 0, 3, 3, 1, 1, 2, 3, 1, 0, 0, 2, 3, 0, 2, 0, 1, 0, 0, 2, 1,
      1, 1, 3, 0, 2, 3, 2, 2, 1, 0, 2, 6, 5, 5, 6, 5, 7, 5, 6, 5, 4, 7, 7, 4, 4,
      4, 6, 4, 5, 6, 4, 7, 5, 7, 5, 6, 4, 4, 7, 7, 6, 4, 7, 5, 7, 6, 6,
    ],
    [
      0, 2, 3, 1, 0, 2, 1, 3, 3, 2, 1, 1, 3, 1, 0, 3, 2, 1, 2, 0, 3, 2, 3, 0, 0,
      1, 0, 3, 0, 0, 2, 2, 1, 3, 2, 1, 5, 5, 6, 4, 6, 7, 6, 6, 4, 7, 5, 6, 4, 7,
      4, 5, 4, 4, 6, 7, 7, 7, 5, 7, 7, 5, 5, 7, 4, 5, 6, 4, 4, 6, 5, 6,
    ],
    [
      2, 3, 2, 3, 1, 3, 2, 1, 1, 0, 0, 0, 2, 3, 2, 1, 0, 3, 2, 3, 3, 1, 2, 1, 0,
      0, 1, 3, 2, 3, 0, 0, 2, 1, 1, 0, 7, 4, 6, 4, 4, 7, 4, 5, 4, 5, 6, 4, 5, 6,
      7, 7, 7, 4, 6, 6, 5, 6, 7, 5, 5, 6, 6, 7, 7, 4, 5, 5, 6, 7, 4, 5,
    ],
    [
      1, 1, 3, 3, 1, 3, 0, 2, 0, 3, 1, 3, 0, 1, 0, 2, 0, 3, 2, 1, 1, 2, 0, 2, 0,
      0, 0, 3, 3, 2, 3, 2, 1, 2, 1, 2, 4, 5, 7, 7, 6, 4, 5, 7, 7, 6, 6, 6, 5, 5,
      4, 7, 5, 7, 6, 4, 6, 7, 5, 4, 6, 5, 4, 7, 4, 6, 6, 4, 7, 4, 5, 5,
    ],
    [
      1, 1, 3, 2, 0, 2, 2, 1, 0, 2, 2, 3, 3, 0, 0, 0, 1, 1, 2, 1, 2, 0, 3, 3, 3,
      0, 3, 3, 1, 0, 3, 2, 2, 0, 1, 1, 6, 7, 4, 6, 5, 6, 5, 6, 5, 5, 5, 6, 4, 7,
      7, 7, 7, 6, 6, 4, 4, 7, 7, 5, 4, 7, 4, 7, 6, 5, 6, 4, 5, 5, 4, 4,
    ],
    [
      0, 0, 1, 3, 1, 1, 2, 3, 2, 3, 3, 1, 2, 0, 2, 0, 3, 3, 2, 3, 3, 0, 2, 0, 1,
      0, 1, 3, 2, 0, 1, 1, 2, 1, 2, 0, 7, 7, 5, 6, 4, 4, 5, 6, 5, 4, 7, 6, 6, 6,
      4, 4, 5, 4, 6, 7, 4, 4, 5, 7, 5, 7, 6, 7, 4, 7, 6, 5, 5, 5, 6, 7,
    ],
    [
      2, 1, 1, 3, 1, 1, 0, 1, 0, 1, 2, 2, 1, 0, 2, 1, 2, 2, 2, 2, 0, 2, 3, 3, 3,
      3, 0, 3, 3, 3, 0, 3, 0, 0, 0, 1, 5, 7, 6, 7, 7, 7, 7, 4, 5, 6, 5, 5, 6, 4,
      6, 6, 7, 5, 6, 4, 4, 5, 4, 7, 4, 4, 7, 7, 6, 5, 4, 6, 6, 5, 5, 4,
    ],
    [
      2, 2, 1, 1, 0, 0, 3, 1, 2, 1, 3, 3, 0, 3, 3, 2, 2, 3, 2, 3, 1, 0, 1, 2, 1,
      3, 1, 3, 0, 2, 2, 0, 0, 1, 0, 0, 5, 7, 5, 6, 4, 6, 4, 6, 5, 6, 7, 6, 4, 4,
      5, 5, 7, 4, 6, 5, 4, 7, 7, 7, 5, 4, 6, 7, 4, 7, 6, 5, 5, 6, 4, 7,
    ],
    [
      0, 1, 2, 1, 2, 3, 1, 1, 1, 3, 3, 3, 2, 2, 2, 0, 3, 0, 2, 3, 2, 2, 1, 1, 0,
      1, 1, 3, 3, 0, 0, 0, 0, 2, 0, 3, 7, 6, 6, 6, 7, 7, 6, 5, 6, 4, 4, 7, 5, 5,
      4, 5, 4, 5, 6, 4, 6, 7, 5, 7, 4, 5, 4, 7, 7, 6, 7, 6, 5, 5, 4, 4,
    ],
    [
      0, 1, 1, 2, 0, 2, 3, 0, 2, 2, 2, 0, 0, 0, 3, 1, 2, 3, 2, 2, 1, 3, 3, 3, 3,
      1, 1, 3, 0, 2, 1, 1, 0, 0, 3, 1, 5, 5, 7, 7, 4, 5, 7, 5, 6, 7, 6, 6, 5, 7,
      6, 7, 6, 4, 6, 4, 4, 4, 5, 7, 4, 4, 6, 7, 6, 5, 5, 4, 4, 6, 7, 5,
    ],
    [
      0, 2, 1, 2, 2, 0, 3, 3, 0, 2, 0, 2, 0, 3, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 3,
      0, 3, 3, 1, 3, 0, 0, 3, 3, 0, 1, 5, 5, 6, 6, 4, 6, 7, 7, 5, 7, 7, 7, 7, 5,
      5, 4, 4, 6, 6, 4, 7, 5, 7, 4, 5, 5, 4, 7, 6, 6, 4, 6, 5, 6, 4, 4,
    ],
    [
      0, 2, 3, 3, 2, 1, 1, 1, 0, 2, 3, 0, 0, 0, 2, 0, 2, 3, 2, 3, 3, 0, 1, 2, 1,
      0, 1, 3, 1, 0, 2, 3, 3, 2, 1, 1, 5, 4, 5, 6, 7, 6, 7, 4, 5, 7, 5, 6, 5, 5,
      7, 5, 4, 4, 6, 6, 4, 4, 4, 5, 7, 7, 6, 7, 7, 7, 6, 6, 6, 4, 5, 4,
    ],
    [
      0, 1, 3, 3, 1, 2, 1, 3, 1, 2, 3, 1, 1, 0, 0, 3, 0, 0, 2, 0, 3, 2, 3, 2, 0,
      1, 1, 3, 2, 2, 0, 3, 1, 2, 0, 2, 5, 4, 6, 6, 7, 6, 6, 5, 5, 7, 6, 5, 4, 4,
      4, 5, 5, 5, 6, 7, 7, 5, 4, 4, 7, 7, 4, 7, 4, 4, 7, 6, 7, 5, 6, 6,
    ],
    [
      1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 3, 3, 2, 3, 3, 0, 2, 0, 2, 3, 0, 2, 3, 2, 3,
      2, 2, 3, 2, 0, 1, 0, 1, 0, 3, 0, 6, 4, 7, 4, 4, 5, 7, 7, 4, 5, 5, 6, 7, 4,
      4, 7, 6, 7, 6, 6, 5, 5, 7, 4, 5, 7, 5, 7, 6, 6, 6, 6, 4, 4, 5, 5,
    ],
    [
      2, 3, 0, 1, 3, 2, 1, 2, 0, 0, 2, 3, 2, 1, 0, 2, 2, 0, 2, 0, 3, 3, 1, 1, 1,
      1, 3, 3, 0, 3, 3, 2, 0, 0, 1, 1, 7, 7, 4, 5, 6, 5, 4, 7, 5, 5, 6, 6, 5, 6,
      6, 6, 7, 4, 6, 7, 6, 7, 5, 4, 6, 5, 7, 7, 5, 7, 4, 4, 4, 4, 5, 4,
    ],
    [
      2, 1, 2, 1, 1, 0, 3, 3, 1, 1, 0, 1, 0, 3, 3, 2, 3, 2, 2, 2, 2, 1, 3, 1, 3,
      1, 0, 3, 2, 0, 3, 0, 2, 0, 0, 0, 5, 5, 7, 6, 4, 7, 4, 4, 4, 6, 4, 4, 7, 4,
      6, 6, 4, 5, 6, 6, 7, 5, 7, 5, 7, 6, 7, 7, 5, 6, 4, 6, 5, 7, 5, 5,
    ],
    [
      2, 3, 1, 2, 1, 0, 2, 0, 2, 1, 2, 2, 0, 3, 1, 0, 3, 1, 2, 1, 3, 1, 0, 0, 1,
      3, 3, 3, 0, 2, 3, 0, 1, 3, 2, 0, 5, 7, 6, 5, 4, 5, 6, 7, 5, 6, 7, 5, 4, 5,
      5, 4, 7, 6, 6, 7, 7, 6, 7, 4, 5, 6, 4, 7, 5, 4, 4, 4, 6, 6, 4, 7,
    ],
    [
      2, 1, 2, 3, 3, 2, 3, 3, 1, 0, 1, 1, 2, 0, 0, 3, 0, 0, 2, 0, 1, 0, 1, 3, 0,
      0, 1, 3, 2, 3, 2, 3, 1, 1, 2, 2, 7, 5, 6, 4, 7, 5, 6, 5, 5, 5, 4, 4, 6, 6,
      7, 7, 6, 5, 6, 7, 7, 5, 4, 7, 7, 4, 4, 7, 4, 5, 5, 4, 4, 6, 6, 6,
    ],
    [
      0, 1, 2, 3, 3, 1, 2, 3, 0, 2, 1, 3, 3, 1, 1, 0, 3, 3, 2, 0, 0, 1, 1, 2, 2,
      2, 0, 3, 3, 0, 2, 2, 0, 0, 1, 1, 5, 5, 7, 6, 6, 4, 4, 6, 5, 7, 4, 6, 7, 6,
      4, 7, 4, 7, 6, 4, 5, 6, 5, 7, 7, 5, 4, 7, 5, 6, 6, 4, 7, 5, 5, 4,
    ],
    [
      1, 1, 2, 3, 1, 1, 1, 3, 2, 3, 2, 0, 2, 1, 0, 0, 3, 0, 2, 3, 2, 2, 0, 0, 0,
      3, 3, 3, 3, 2, 1, 2, 1, 0, 1, 0, 4, 5, 6, 4, 6, 7, 4, 5, 5, 6, 6, 7, 6, 5,
      5, 5, 6, 4, 6, 7, 6, 7, 5, 4, 7, 5, 7, 7, 6, 4, 4, 4, 7, 5, 4, 7,
    ],
    [
      3, 1, 1, 0, 2, 1, 0, 3, 2, 0, 2, 0, 3, 0, 1, 1, 2, 3, 2, 3, 0, 1, 1, 3, 2,
      0, 1, 3, 3, 2, 0, 1, 2, 2, 3, 0, 4, 5, 6, 7, 4, 7, 7, 7, 5, 7, 6, 7, 6, 5,
      6, 6, 6, 4, 6, 4, 5, 5, 5, 4, 4, 4, 6, 7, 7, 5, 5, 6, 5, 4, 4, 7,
    ],
    [
      2, 2, 1, 0, 1, 1, 1, 2, 0, 0, 1, 3, 1, 3, 3, 3, 3, 1, 2, 2, 0, 2, 2, 2, 0,
      1, 3, 3, 3, 0, 0, 0, 0, 3, 2, 1, 7, 6, 7, 7, 4, 4, 7, 6, 5, 5, 7, 5, 4, 6,
      4, 5, 7, 6, 6, 4, 4, 5, 7, 6, 6, 5, 4, 7, 6, 6, 4, 5, 5, 5, 7, 4,
    ],
    [
      3, 2, 3, 1, 0, 0, 1, 0, 0, 1, 2, 2, 3, 1, 1, 3, 2, 3, 2, 1, 2, 0, 1, 3, 3,
      0, 0, 3, 0, 3, 0, 2, 1, 2, 1, 2, 6, 5, 6, 5, 6, 7, 7, 5, 7, 4, 6, 7, 4, 4,
      5, 6, 4, 7, 6, 4, 5, 5, 5, 7, 7, 4, 4, 7, 6, 6, 7, 5, 4, 4, 6, 5,
    ],
    [
      2, 1, 3, 1, 1, 2, 3, 3, 3, 1, 3, 0, 3, 2, 2, 1, 1, 0, 2, 0, 3, 2, 0, 0, 2,
      2, 3, 3, 2, 0, 0, 0, 1, 0, 1, 1, 5, 6, 5, 5, 7, 4, 7, 4, 4, 6, 6, 6, 4, 5,
      7, 6, 5, 4, 6, 5, 6, 7, 5, 7, 4, 5, 7, 7, 5, 6, 4, 4, 4, 7, 7, 6,
    ],
    [
      0, 2, 1, 2, 3, 2, 0, 0, 2, 3, 3, 3, 3, 1, 2, 0, 1, 2, 2, 1, 0, 3, 1, 2, 1,
      3, 0, 3, 1, 1, 2, 0, 0, 0, 3, 1, 7, 6, 7, 6, 5, 4, 5, 5, 6, 4, 5, 4, 4, 6,
      7, 4, 7, 5, 6, 5, 5, 7, 4, 6, 7, 4, 7, 7, 6, 6, 7, 4, 6, 4, 5, 5,
    ],
    [
      0, 3, 1, 1, 3, 2, 0, 3, 1, 2, 2, 2, 3, 2, 0, 2, 0, 3, 2, 1, 3, 0, 1, 3, 1,
      0, 0, 3, 3, 1, 0, 1, 1, 2, 2, 0, 5, 6, 4, 6, 5, 5, 7, 6, 4, 7, 6, 5, 7, 6,
      4, 4, 4, 7, 6, 4, 7, 7, 6, 7, 5, 7, 4, 7, 5, 6, 5, 4, 5, 4, 6, 5,
    ],
    [
      0, 3, 1, 1, 1, 0, 0, 0, 2, 3, 1, 1, 0, 0, 2, 2, 2, 1, 2, 2, 0, 3, 0, 1, 2,
      3, 3, 3, 1, 3, 0, 2, 2, 3, 3, 1, 7, 6, 6, 4, 5, 4, 6, 6, 6, 4, 4, 7, 7, 5,
      6, 6, 5, 6, 6, 5, 4, 7, 7, 5, 7, 5, 4, 7, 5, 4, 4, 4, 7, 5, 7, 5,
    ],
    [
      3, 1, 3, 2, 0, 3, 0, 1, 1, 0, 0, 2, 2, 2, 1, 3, 0, 1, 2, 1, 1, 1, 1, 2, 3,
      0, 3, 3, 0, 0, 3, 0, 3, 2, 2, 2, 4, 5, 4, 7, 7, 7, 6, 5, 5, 7, 4, 7, 5, 4,
      4, 4, 4, 6, 6, 7, 6, 6, 5, 7, 7, 5, 4, 7, 5, 5, 6, 5, 6, 4, 6, 6,
    ],
    [
      0, 0, 1, 1, 3, 2, 3, 2, 0, 3, 1, 3, 3, 2, 1, 2, 3, 0, 2, 0, 0, 2, 1, 3, 1,
      1, 1, 3, 3, 0, 0, 1, 2, 2, 0, 2, 7, 6, 7, 4, 5, 6, 7, 4, 7, 4, 5, 5, 4, 6,
      5, 5, 4, 5, 6, 7, 5, 5, 6, 7, 6, 7, 4, 7, 7, 6, 4, 4, 4, 6, 6, 5,
    ],
    [
      2, 1, 0, 2, 1, 2, 3, 3, 0, 1, 2, 2, 1, 0, 1, 0, 3, 1, 2, 2, 0, 1, 0, 0, 3,
      1, 3, 3, 0, 3, 3, 3, 2, 0, 1, 2, 5, 5, 6, 7, 7, 7, 4, 7, 7, 6, 6, 6, 4, 5,
      4, 7, 5, 6, 6, 5, 7, 5, 4, 5, 7, 6, 4, 7, 6, 5, 4, 4, 4, 6, 4, 5,
    ],
  ];
  console.log("generating tables");
  let start = performance.now();
  solver(solved_state);
  console.log(performance.now() - start);
  let solve_times = [];
  let move_counts = [];
  console.log("solving");
  for (let scramble of some_scrambles) {
    let start = performance.now();
    let sol = solver(scramble);
    let elapsed = performance.now() - start;
    solve_times.push(elapsed);
    move_counts.push(sol.length);
    let score = grade_readability(sol);
    console.log(elapsed, sol.length, score);
    if (apply_move_sequence(scramble, sol).join("") !== solved_state.join("")) {
      console.log("solving failed!");
    }
  }
  console.log(
    `mean solve time: ${
      solve_times.reduce((x, y) => x + y) / some_scrambles.length
    }`,
  );
  console.log(
    `mean move count: ${
      move_counts.reduce((x, y) => x + y) / some_scrambles.length
    }`,
  );
  //let sorted_solve_times = solve_times.slice().sort((x, y) => x-y);
}
