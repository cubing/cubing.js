/* kilosolver.js - A kilominx solver
version 0.7 (2021-04-03)
Copyright (c) 2016, 2020, 2021

From https://torchlight.github.io/kiloscrambler.html
Originally MIT licensed, added to `cubing.js` under the GPL license by permission from the author (@torchlight/xyzzy).

This is a port of the kilominx solver originally written in Python with a few minor optimisations.

How to run this:
(0) Save this file somewhere.
(1) Install any JavaScript shell and run it with this file.
(2) Type stuff into the shell.

(or just use the HTML interface! it exists now!)

There is currently not much of a public interface. Useful stuff:
cache_all_tables()
    to generate all the lookup tables
print_move_sequence(generate_random_state_scramble())
    to get a random-state scramble
print_move_sequence(generate_hybrid_scramble())
    to get a hybrid random-move scramble

For the full solver (used in the random-state scrambler), a few hundred megabytes of RAM may be used
for the lookup tables, which will also take roughly a minute to generate. Once generated, each solve
takes roughly 0.08 second.

The hybrid scrambler uses much smaller lookup tables that take less memory and are generated faster,
but produces somewhat longer scramble sequences and isn't fully random-state. It should nevertheless
be good enough for non-competition purposes.

On the to-do list:
- optimise the heck out of the lookup table generation
- a GUI for the solver
- optimise the solver with colour neutrality and NISS(tm) techniques
- throw all the global variables into a namespace

Compatibility notes:
This code makes fairly heavy use of ES6 syntactic sugar because writing code in JavaScript's already
an exercise in masochism and I'm not going to make my life harder by restricting myself to ES5. Some
of the features used are:
- let, const
- destructuring assignment
- for-of
- arrow functions
- 'use strict'

Any web browser from 2016 or later should support all of these; the code has been tested only on the
latest versions of Firefox and Chrome, as well as a somewhat outdated SpiderMonkey shell, but should
also work with recent versions of Edge, Safari, etc.
*/

"use strict";

import { Alg } from "../../../alg";
import { randomUIntBelow } from "random-uint-below";

let PHASE4_THRESHOLD = 7;
// change this to 8 to make the individual solves faster, at the cost of slower initialisation

function counter(A) {
  let counts = [];
  for (let a of A) {
    counts[a] = (counts[a] || 0) + 1;
  }
  return counts;
}

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

let [evenpermutation10_to_index, index_to_evenpermutation10] = (() => {
  let index_in_set_bits = new Int8Array(1024 * 10);
  let look_up_set_bits = new Int8Array(1024 * 10);
  for (let i = 0; i < 1024; i++) {
    for (let j = 0, counter = 0; j < 10; j++) {
      if (((i >>> j) & 1) === 0) {
        continue;
      }
      index_in_set_bits[(j << 10) | i] = counter;
      look_up_set_bits[(counter << 10) | i] = j;
      counter++;
    }
  }

  function evenpermutation10_to_index(perm) {
    let unused = 0x3ff; // track which values in 0..9 haven't been used so far
    let f = 181440; // = 9!/2
    let ind = 0;
    for (let i = 0; i < 8; i++) {
      let v = perm[i];
      ind += index_in_set_bits[unused | (v << 10)] * f;
      unused &= ~(1 << v);
      f /= 9 - i;
    }
    return ind;
  }

  // note: this is *not* a drop-in replacement for index_to_evenpermutation!
  function index_to_evenpermutation10(ind, perm) {
    let unused = 0x3ff;
    let f = 181440; // = 9!/2
    let parity = 0;
    for (let i = 0; i < 8; i++) {
      let a = (ind / f) | 0;
      ind -= a * f;
      parity ^= a & 1;
      let v = look_up_set_bits[unused | (a << 10)];
      perm[i] = v;
      unused &= ~(1 << v);
      f /= 9 - i;
    }
    // the last two elements are uniquely determined by the other ten
    perm[8] = look_up_set_bits[unused | (parity << 10)];
    perm[9] = look_up_set_bits[unused | ((parity ^ 1) << 10)];
    return perm;
  }

  return [evenpermutation10_to_index, index_to_evenpermutation10];
})();

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

function compose(A, B) {
  let C = [];
  for (let i = 0; i < B.length; i++) {
    C[i] = A[B[i]];
  }
  return C;
}

function compose_o(A, B) {
  // note: we hardcode the modulus to 3 here, because ~optimisations~
  // (unnecessary abstraction is bad, actually)
  let p = compose(A[0], B[0]);
  let o = [];
  let n = B[0].length;
  for (let i = 0; i < n; i++) {
    o[i] = (A[1][B[0][i]] + B[1][i]) % 3;
  }
  return [p, o];
}

function permutation_from_cycle(cycle, n) {
  let perm = [];
  for (let i = 0; i < n; i++) {
    perm[i] = i;
  }
  for (let i = 0; i < cycle.length; i++) {
    perm[cycle[i]] = cycle[(i + 1) % cycle.length];
  }
  return perm;
}

function unsparsify_list(d, n) {
  let l = Array(n).fill(0);
  for (let k in d) {
    l[k] = d[k];
  }
  return l;
}

/* The basic moves */

const move_U = [
  permutation_from_cycle([0, 1, 2, 3, 4], 20),
  unsparsify_list({}, 20),
];
const move_R = [
  permutation_from_cycle([4, 3, 11, 12, 13], 20),
  unsparsify_list({ 4: 2, 3: 1, 11: 1, 12: 1, 13: 1 }, 20),
];
const move_F = [
  permutation_from_cycle([3, 2, 9, 10, 11], 20),
  unsparsify_list({ 3: 2, 2: 1, 9: 1, 10: 1, 11: 1 }, 20),
];
const move_L = [
  permutation_from_cycle([2, 1, 7, 8, 9], 20),
  unsparsify_list({ 2: 2, 1: 1, 7: 1, 8: 1, 9: 1 }, 20),
];
let move_BL = [
  permutation_from_cycle([1, 0, 5, 6, 7], 20),
  unsparsify_list({ 1: 2, 0: 1, 5: 1, 6: 1, 7: 1 }, 20),
];
let move_BR = [
  permutation_from_cycle([0, 4, 13, 14, 5], 20),
  unsparsify_list({ 0: 2, 4: 1, 13: 1, 14: 1, 5: 1 }, 20),
];
let move_x2 = [
  [15, 16, 17, 18, 19, 10, 9, 8, 7, 6, 5, 14, 13, 12, 11, 0, 1, 2, 3, 4],
  unsparsify_list({}, 20),
];
let move_y = [
  [1, 2, 3, 4, 0, 7, 8, 9, 10, 11, 12, 13, 14, 5, 6, 19, 15, 16, 17, 18],
  unsparsify_list({}, 20),
];
let move_rot = [
  [9, 10, 11, 3, 2, 8, 16, 15, 19, 12, 13, 4, 0, 1, 7, 14, 18, 17, 6, 5],
  [2, 0, 1, 2, 1, 2, 2, 0, 1, 1, 1, 1, 0, 2, 2, 1, 2, 1, 2, 0],
];

const moves = [move_U, move_R, move_F, move_L, move_BL, move_BR, move_x2];
const move_names = ["U", "R", "F", "L", "BL", "BR", "x2"];

let id = compose_o(move_x2, move_x2);

let moves_full = [];
for (let i = 0; i < moves.length; i++) {
  moves_full[i] = [id];
  for (let j = 1; j < 5; j++) {
    moves_full[i][j] = compose_o(moves_full[i][j - 1], moves[i]);
  }
}

function random_state() {
  let p = [0];
  for (let i = 1; i < 20; i++) {
    let r = randomUIntBelow(i + 1);
    p[i] = p[r];
    p[r] = i;
  }
  if (permutation_parity(p) === 1) {
    [p[0], p[1]] = [p[1], p[0]];
  }
  let o = Array(20).fill(0);
  for (let i = 0; i < 19; i++) {
    o[i] = randomUIntBelow(3);
    o[19] += 3 - o[i];
  }
  o[19] %= 3;
  return [p, o];
}

/* Human interface stuff */

function stringify_move_sequence(move_sequence) {
  let suffixes = ["0", "", "2", "2'", "'"];
  let s = move_sequence.map(([m, r]) => move_names[m] + suffixes[r]);
  return s.join(" ");
}

function print_move_sequence(move_sequence) {
  console.log(stringify_move_sequence(move_sequence));
}

function apply_move_sequence(state, move_sequence) {
  for (let [m, r] of move_sequence) {
    for (let i = 0; i < r; i++) {
      state = compose_o(state, moves[m]);
    }
  }
  return state;
}

function generate_random_state_scramble() {
  return solve(random_state());
}

/* a brief note on analysing random-move scrambles

Let M = num flips and N = num moves between flips.

Tracking just corner orientation is pretty much useless to determine if a scramble is good, at least
for the choice of CO reference used in the solver (<U,flip,(R'FRF')3>); even M=1, N=8 is good enough
to randomise the CO, despite leaving a bunch of obvious blocks.

Instead, we can track the location of, say, the white pieces. There are C(20, 5) combinations, so we
just try out a million random-move scrambles and do a chi-squared test. (Except I don't have a stats
package installed, so this is just a qualitative approximation.)

M=4, N=5 (29 moves): +2.7 stddev
M=3, N=8 (35 moves): +15.7 stddev
M=5, N=5 (35 moves): -0.1 stddev
M=4, N=7 (39 moves): +3.8 stddev
M=5, N=6 (41 moves): -0.4 stddev
M=4, N=8 (44 moves): +2.2 stddev

(the 95% confidence interval for these estimated values should be taken to be +-2, as usual)

Obviously we get closer to a uniform distribution with more moves, but we also want the scrambles to
be of a reasonable length. M=5, N=6 seems to be a good tradeoff.

This is until you realise that the five grey pieces are effectively scrambled with M reduced by one,
so we compensate for that by using M=6, N=6, which gives 48-move scrambles.

(tl;dr: use the hybrid scrambler if you can stomach 0.3-second initialisation; don't use this)
*/

/* Solver logic

For scrambling purposes, we have these two options:
(i) generate a random state, solve it, then invert the solution
(ii) generate a random state, solve it, return the solution as is

The former has a caveat that "solve" really means "solve into the scramble orientation". If we solve
into an arbitrary orientation, the result is a random-modulo-orientation state, in that the scramble
has the same relative positions of pieces as the random state, but possibly with the wrong colours.

The latter works here because the kilominx states form a group and taking the inverse doesn't affect
the randomness, and we do have the freedom to solve into any orientation. Since the WCA regs specify
that scrambled puzzles are delivered to the competitor in an arbitrary orientation, we may take this
to be equivalent to right-composing with a random rotation, and this would "cancel out" any rotation
showing up at the end of the solution.

Solving to orientations other than white-top-green-front saves a few moves (~2.2 moves by testing 10
orientations out of 60), but it's also proportionally slower for marginal gain.

Phases used:

Phase 1: get the five grey corners out of the U layer (6-gen), then rotate.

Phase 2: form the U layer out of the grey corners (6-gen), then rotate.

Phase 3: solve five more corners at the back/left to reduce to <U,R,F> (6-gen).

Phase 4: finish last three faces (3-gen).

Phase 1 is a skip (all five grey corners are already not on the D layer) ~19% of the time, and takes
just one flip ~18% of the time, so there's a ~37% chance this step is basically trivial. With colour
neutrality, this could be something like 99.9% trivial.

Phases 2 and 3 make use of the same permutation/orientation move tables. Ideally, we'd use only one,
but it would be kinda terrible for a web app to eat hundreds of megabytes of memory. Luckily for us,
IDA* settles these phases quickly enough that it doesn't really matter. Unluckily for us, this makes
the code a bit more complicated.

Phase 4 is the problematic one, with 35.7 billion states. We use three pruning tables:
- orientation (3^9 = 19683 states)
- permutation (10!/2 = 1814400 states)
- list of states up to 7 moves (3565896 states)

We don't even need to store the actual distances for the almost-solved states; we just let IDA* work
its magic with the other pruning tables. Basically, if a state is in the list, the heuristic reports
a lower bound of 0, and if it's not, it reports a lower bound of 8.
*/

function solve_phase1(state) {
  // we don't care about orientation.
  let p = state[0];
  // x < 15 tests if a piece is non-grey.
  if (p.slice(15, 20).every((x) => x < 15)) {
    return [];
  }
  if (p.slice(0, 5).every((x) => x < 15)) {
    return [[6, 1]];
  }
  let flags = p.map((x) => x >= 15);
  let depth = 0;
  let sol;
  while (sol === undefined) {
    depth++;
    sol = search_phase1(flags, depth, -1);
  }
  sol.push([6, 1]);
  return sol;
}

function search_phase1(flags, depth, last) {
  if (depth === 0) {
    if (flags.slice(0, 5).some((x) => x)) {
      return;
    }
    return [];
  }
  for (let move_index = 0; move_index < 6; move_index++) {
    if (move_index === last) {
      continue;
    }
    for (let r = 1; r < 5; r++) {
      let new_flags = compose(flags, moves_full[move_index][r][0]);
      let sol = search_phase1(new_flags, depth - 1, move_index);
      if (sol !== undefined) {
        return [[move_index, r]].concat(sol);
      }
    }
  }
  return;
}

function index_phase2(state) {
  let p = state[0].slice(0, 15);
  let o = state[1];
  let index_c = comb_to_index(p.map((x) => +(x >= 15)));
  let index_o = 243 * index_c;
  for (let i = 0, j = 0; i < 15; i++) {
    if (p[i] < 15) {
      continue;
    }
    index_o += o[i] * Math.pow(3, j);
    // as it so happens, my JS shell is too outdated and doesn't support **
    j++;
  }
  let index_p = 0;
  for (let i = 0; i < 5; i++) {
    index_p += p.indexOf(15 + i) * Math.pow(15, i);
  }
  return [index_o, index_p];
}

function solve_phase2(state) {
  let mtables = [
    generate_phase23_orientation_mtable(),
    generate_phase23_permutation_mtable(),
  ];
  let ptables = [
    generate_phase2_orientation_ptable(),
    generate_phase2_permutation_ptable(),
  ];
  return ida_solve(index_phase2(state), mtables, ptables).concat([[6, 1]]);
}

function index_phase3(state) {
  let pieces = [5, 6, 7, 8, 14];
  let p = state[0].slice(0, 15);
  let o = state[1];
  let index_c = comb_to_index(p.map((x) => +(pieces.indexOf(x) !== -1)));
  let index_o = 243 * index_c;
  for (let i = 0, j = 0; i < 15; i++) {
    if (pieces.indexOf(p[i]) === -1) {
      continue;
    }
    index_o += o[i] * Math.pow(3, j);
    j++;
  }
  let index_p = 0;
  for (let i = 0; i < 5; i++) {
    index_p += p.indexOf(pieces[i]) * Math.pow(15, i);
  }
  return [index_o, index_p];
}

function solve_phase3(state) {
  let mtables = [
    generate_phase23_orientation_mtable(),
    generate_phase23_permutation_mtable(),
  ];
  let ptables = [
    generate_phase3_orientation_ptable(),
    generate_phase3_permutation_ptable(),
  ];
  return ida_solve(index_phase3(state), mtables, ptables);
}

function index_phase4(state) {
  let p = state[0].slice(0, 14);
  let o = state[1];
  let index_o = 0;
  let perm = [];
  let j = 0;
  for (let i of [0, 1, 2, 3, 4, 9, 10, 11, 12, 13]) {
    if (i !== 13) {
      index_o += o[i] * Math.pow(3, j);
    }
    perm[j] = p[i] < 5 ? p[i] : p[i] - 4;
    j++;
  }
  return [index_o, evenpermutation_to_index(perm)];
}

function solve_phase4(state) {
  let mtables = [
    generate_phase4_orientation_mtable(),
    generate_phase4_permutation_mtable(),
  ];
  let ptables = [
    generate_phase4_orientation_ptable(),
    generate_phase4_permutation_ptable(),
  ];
  return ida_solve(index_phase4(state), mtables, ptables);
}

function solve_phase4_fast(state) {
  return phase4_ida_solve(index_phase4(state));
}

function solve(state) {
  let sol = [];
  for (let solver of [
    solve_phase1,
    solve_phase2,
    solve_phase3,
    solve_phase4_fast,
  ]) {
    //console.log(`solving with ${solver.name}`);
    let phase_sol = solver(state);
    state = apply_move_sequence(state, phase_sol);
    //console.log(`solution: ${stringify_move_sequence(phase_sol)}`);
    sol = sol.concat(phase_sol);
  }
  return sol;
}

function cn_solve(state) {
  // Solve with partial colour neutrality. We don't want to check all 120 cases, so we look only
  // at <y, flip>-neutrality, which has 10 cases.
  let sol_lengths = [];
  let shortest_sol;
  let shortest_sol_length = 999999;
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 5; y++) {
      let sol = solve(state);
      sol_lengths.push(sol.length);
      if (shortest_sol_length > sol.length) {
        shortest_sol_length = sol.length;
        shortest_sol = sol;
      }
      state = compose_o(move_y, state);
    }
    state = compose_o(move_x2, state);
  }
  console.log(`solution lengths: ${sol_lengths.join(", ")}`);
  return shortest_sol;
}

const tables = {};

function generate_phase23_orientation_mtable() {
  if (tables.phase23om) {
    return tables.phase23om;
  }
  const C15_5 = C(15, 5);
  const THREE = [1, 3, 9, 27, 81, 243];
  let phase23om = Array(C(15, 5) * THREE[5]);
  tables.phase23om = phase23om;
  for (let i = 0; i < C15_5; i++) {
    let comb = index_to_comb(i, 5, 15).concat(Array(5).fill(0));
    let new_comb_indices = [];
    for (let move_index = 0; move_index < 6; move_index++) {
      let new_comb = compose(comb, moves[move_index][0]).slice(0, 15);
      new_comb_indices[move_index] = comb_to_index(new_comb);
    }
    for (let j = 0; j < THREE[5]; j++) {
      phase23om[j + 243 * i] = [];
      let orient_full = [];
      for (let k = 0, l = 0; k < 20; k++) {
        if (comb[k] === 1) {
          orient_full[k] = ((j / THREE[l]) | 0) % 3;
          l++;
        } else {
          orient_full[k] = 99; // some irrelevant garbage value
        }
      }
      for (let move_index = 0; move_index < 6; move_index++) {
        let move = moves[move_index];
        let new_orient_full = [];
        for (let k = 0; k < 15; k++) {
          new_orient_full[k] = orient_full[move[0][k]] + move[1][k];
        }
        let new_orient = new_orient_full.filter((x) => x < 10); // get rid of garbage
        let J = 0;
        for (let k = 0; k < 5; k++) {
          J += (new_orient[k] % 3) * THREE[k];
        }
        phase23om[j + 243 * i][move_index] =
          J + 243 * new_comb_indices[move_index];
      }
    }
  }
  return phase23om;
}

function generate_phase2_orientation_ptable() {
  if (tables.phase2op) {
    return tables.phase2op;
  }
  let mtable = generate_phase23_orientation_mtable();
  return (tables.phase2op = bfs(mtable, [243 * 3002]));
}

function generate_phase3_orientation_ptable() {
  if (tables.phase3op) {
    return tables.phase3op;
  }
  let mtable = generate_phase23_orientation_mtable();
  return (tables.phase3op = bfs(mtable, [243 * 246]));
}

function generate_phase23_permutation_mtable() {
  if (tables.phase23pm) {
    return tables.phase23pm;
  }
  const FIFTEEN = [
    1,
    15,
    225,
    Math.pow(15, 3),
    Math.pow(15, 4),
    Math.pow(15, 5),
  ];
  let phase23pm = Array(FIFTEEN[5]);
  let single = Array(15);
  for (let i = 0; i < 15; i++) {
    single[i] = Array(6);
    for (let move_index = 0; move_index < 6; move_index++) {
      single[i][move_index] = moves[move_index][0].indexOf(i);
    }
  }
  let locations = [0, 0, 0, 0, 0];
  for (let ind = 0; ind < FIFTEEN[5]; ind++) {
    phase23pm[ind] = Array(6);
    for (let move_index = 0; move_index < 6; move_index++) {
      let new_ind = 0;
      for (let i = 0; i < 5; i++) {
        new_ind += single[locations[i]][move_index] * FIFTEEN[i];
      }
      phase23pm[ind][move_index] = new_ind;
    }
    locations[0]++;
    for (let i = 0; i < 4; i++) {
      if (locations[i] === 15) {
        locations[i] = 0;
        locations[i + 1]++;
      }
    }
  }
  return (tables.phase23pm = phase23pm);
}

function generate_phase2_permutation_ptable() {
  if (tables.phase2pp) {
    return tables.phase2pp;
  }
  let mtable = generate_phase23_permutation_mtable();
  return (tables.phase2pp = bfs(mtable, [213090]));
}

function generate_phase3_permutation_ptable() {
  if (tables.phase3pp) {
    return tables.phase3pp;
  }
  let mtable = generate_phase23_permutation_mtable();
  return (tables.phase3pp = bfs(mtable, [737420]));
}

function generate_phase4_orientation_mtable() {
  if (tables.phase4om) {
    return tables.phase4om;
  }
  const THREE = [1, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049];
  let mtable = Array(THREE[9]);
  for (let i = 0; i < THREE[9]; i++) {
    let o = Array(14).fill(0);
    for (let j = 0; j < 9; j++) {
      let J = j < 5 ? j : j + 4;
      o[J] = ((i / THREE[j]) | 0) % 3;
      o[13] -= o[J];
    }
    o[13] = (o[13] + 999) % 3;
    mtable[i] = [];
    for (let move_index = 0; move_index < 3; move_index++) {
      let move = moves[move_index];
      let new_o = [0, 1, 2, 3, 4, 9, 10, 11, 12, 13].map(
        (i) => o[move[0][i]] + move[1][i],
      );
      let new_i = 0;
      for (let j = 0; j < 9; j++) {
        new_i += (new_o[j] % 3) * THREE[j];
      }
      mtable[i][move_index] = new_i;
    }
  }
  return (tables.phase4om = mtable);
}

function generate_phase4_permutation_mtable() {
  if (tables.phase4pm) {
    return tables.phase4pm;
  }
  const HALFFACT10 = factorial(10) / 2;
  const n = 10;
  let pre = [0, 1, 2, 3, 4, -1, -1, -1, -1, 5, 6, 7, 8, 9];
  let post = [0, 1, 2, 3, 4, 9, 10, 11, 12, 13];
  let move_permutations = [
    compose(pre, compose(move_U[0], post)),
    compose(pre, compose(move_R[0], post)),
    compose(pre, compose(move_F[0], post)),
  ];
  let mtable = Array(HALFFACT10);
  let perm = Array(10);
  for (let i = 0; i < HALFFACT10; i++) {
    index_to_evenpermutation10(i, perm);
    mtable[i] = [];
    for (let move_index = 0; move_index < 3; move_index++) {
      let new_perm = compose(perm, move_permutations[move_index]);
      mtable[i][move_index] = evenpermutation10_to_index(new_perm);
    }
  }
  return (tables.phase4pm = mtable);
}

function generate_phase4_orientation_ptable() {
  if (tables.phase4op) {
    return tables.phase4op;
  }
  let mtable = generate_phase4_orientation_mtable();
  return (tables.phase4op = bfs(mtable, [0]));
}

function generate_phase4_permutation_ptable() {
  if (tables.phase4pp) {
    return tables.phase4pp;
  }
  let mtable = generate_phase4_permutation_mtable();
  return (tables.phase4pp = bfs(mtable, [0]));
}

function generate_phase4_near_ptable_list(threshold) {
  if (tables.phase4np_list && tables.phase4np_list.threshold === threshold) {
    return tables.phase4np_list;
  }
  let mtables = [
    generate_phase4_orientation_mtable(),
    generate_phase4_permutation_mtable(),
  ];
  let base = Math.pow(3, 9);
  let states = [0];
  populate(threshold, [0, 0], -1);
  function populate(depth, state, last) {
    states.push(state[0] + base * state[1]);
    if (depth === 0) {
      return;
    }
    let new_state = [];
    for (let move_index = 0; move_index < 3; move_index++) {
      if (move_index === last) {
        continue;
      }
      new_state[0] = state[0];
      new_state[1] = state[1];
      for (let r = 1; r < 5; r++) {
        new_state[0] = mtables[0][new_state[0]][move_index];
        new_state[1] = mtables[1][new_state[1]][move_index];
        populate(depth - 1, new_state, move_index);
      }
    }
    return;
  }
  states.sort((x, y) => x - y);
  let unique_states = [];
  let last = -1;
  for (let state of states) {
    if (state !== last) {
      unique_states.push((last = state));
    }
  }
  unique_states.threshold = threshold;
  return (tables.phase4np_list = unique_states);
}

function binary_search(A, x) {
  let lo = 0;
  let hi = A.length - 1;
  while (hi - lo > 1) {
    // invariants: hi - lo >= 2; x > A[lo-1]; x < A[hi+1]
    let mid = (lo + hi) >> 1; // lo < mid < hi
    if (x > A[mid]) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return x === A[lo] || x === A[hi];
}

function cache_all_tables() {
  let time = +new Date();
  let splits = [time];
  console.log("generating phase 2/3 move tables...");
  generate_phase23_orientation_mtable();
  generate_phase23_permutation_mtable();
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log("generating phase 2 pruning tables...");
  generate_phase2_orientation_ptable();
  generate_phase2_permutation_ptable();
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log("generating phase 3 pruning tables...");
  generate_phase3_orientation_ptable();
  generate_phase3_permutation_ptable();
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log("generating phase 4 move tables...");
  generate_phase4_orientation_mtable();
  generate_phase4_permutation_mtable();
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log("generating phase 4 pruning tables...");
  generate_phase4_orientation_ptable();
  generate_phase4_permutation_ptable();
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log("generating phase 4 bonus pruning table...");
  generate_phase4_near_ptable_list(PHASE4_THRESHOLD);
  splits.push(+new Date());
  console.log(
    `done ${(
      (splits[splits.length - 1] - splits[splits.length - 2]) /
      1e3
    ).toFixed(3)}`,
  );

  console.log(
    `total elapsed: ${((splits[splits.length - 1] - splits[0]) / 1000).toFixed(
      3,
    )}`,
  );
}

function bfs(mtable, goal_states) {
  let N = mtable.length;
  let nmoves = mtable[0].length;
  let ptable = Array(N).fill(-1);
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
        let new_state = mtable[state][move_index];
        while (new_state !== state) {
          if (ptable[new_state] === -1) {
            done = false;
            ptable[new_state] = depth + 1;
          }
          new_state = mtable[new_state][move_index];
        }
      }
    }
    depth++;
  }
  return ptable;
}

function ida_solve(indices, mtables, ptables) {
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (true) {
    let path = ida_search(indices, mtables, ptables, bound, -1);
    if (path !== undefined) {
      return path;
    }
    bound++;
  }
}

function ida_search(indices, mtables, ptables, bound, last) {
  let ncoords = indices.length;
  let nmoves = mtables[0][0].length;
  let heuristic = 0;
  for (let i = 0; i < ncoords; i++) {
    heuristic = Math.max(heuristic, ptables[i][indices[i]]);
  }
  if (heuristic > bound) {
    return;
  }
  if (bound === 0 || heuristic === 0) {
    return [];
  }
  for (let m = 0; m < nmoves; m++) {
    if (m === last) {
      continue;
    }
    let new_indices = indices.slice();
    for (let c = 0; c < ncoords; c++) {
      new_indices[c] = mtables[c][indices[c]][m];
    }
    let r = 1;
    while (indices.some((_, i) => indices[i] !== new_indices[i])) {
      let subpath = ida_search(new_indices, mtables, ptables, bound - 1, m);
      if (subpath !== undefined) {
        return [[m, r]].concat(subpath);
      }
      for (let c = 0; c < ncoords; c++) {
        new_indices[c] = mtables[c][new_indices[c]][m];
      }
      r++;
    }
  }
  return;
}

function phase4_ida_solve(indices) {
  let mtable_o = generate_phase4_orientation_mtable();
  let mtable_p = generate_phase4_permutation_mtable();
  let ptable_o = generate_phase4_orientation_ptable();
  let ptable_p = generate_phase4_permutation_ptable();
  let ptable_n = generate_phase4_near_ptable_list(PHASE4_THRESHOLD);
  let bound = Math.max(ptable_o[indices[0]], ptable_p[indices[1]]);
  while (true) {
    let path = phase4_ida_search(
      indices,
      bound,
      -1,
      mtable_o,
      mtable_p,
      ptable_o,
      ptable_p,
      ptable_n,
    );
    if (path !== undefined) {
      return path;
    }
    bound++;
  }
}

function phase4_ida_search(
  indices,
  bound,
  last,
  mtable_o,
  mtable_p,
  ptable_o,
  ptable_p,
  ptable_n,
) {
  let heuristic = Math.max(ptable_o[indices[0]], ptable_p[indices[1]]);
  if (heuristic > bound) {
    return;
  }
  if (
    heuristic <= PHASE4_THRESHOLD &&
    !binary_search(ptable_n, indices[0] + 19683 * indices[1])
  ) {
    heuristic = PHASE4_THRESHOLD + 1;
  }
  if (heuristic > bound) {
    return;
  }
  if (bound === 0 || heuristic === 0) {
    return [];
  }
  for (let m = 0; m < 3; m++) {
    if (m === last) {
      continue;
    }
    let new_indices = indices.slice();
    for (let r = 1; r < 5; r++) {
      new_indices[0] = mtable_o[new_indices[0]][m];
      new_indices[1] = mtable_p[new_indices[1]][m];
      let subpath = phase4_ida_search(
        new_indices,
        bound - 1,
        m,
        mtable_o,
        mtable_p,
        ptable_o,
        ptable_p,
        ptable_n,
      );
      if (subpath !== undefined) {
        return [[m, r]].concat(subpath);
      }
    }
  }
  return;
}

function* phase4_ida_solve_gen(indices) {
  let mtable_o = generate_phase4_orientation_mtable();
  let mtable_p = generate_phase4_permutation_mtable();
  let ptable_o = generate_phase4_orientation_ptable();
  let ptable_p = generate_phase4_permutation_ptable();
  let ptable_n = generate_phase4_near_ptable_list(PHASE4_THRESHOLD);
  let bound = Math.max(ptable_o[indices[0]], ptable_p[indices[1]]);
  while (true) {
    yield* phase4_ida_search_gen(
      indices,
      bound,
      -1,
      mtable_o,
      mtable_p,
      ptable_o,
      ptable_p,
      ptable_n,
    );
    bound++;
  }
}

function* phase4_ida_search_gen(
  indices,
  bound,
  last,
  mtable_o,
  mtable_p,
  ptable_o,
  ptable_p,
  ptable_n,
) {
  let heuristic = Math.max(ptable_o[indices[0]], ptable_p[indices[1]]);
  if (heuristic > bound) {
    return;
  }
  if (
    heuristic <= PHASE4_THRESHOLD &&
    !binary_search(ptable_n, indices[0] + 19683 * indices[1])
  ) {
    heuristic = PHASE4_THRESHOLD + 1;
  }
  if (heuristic > bound) {
    return;
  }
  if (bound === 0 || heuristic === 0) {
    yield [];
  }
  for (let m = 0; m < 3; m++) {
    if (m === last) {
      continue;
    }
    let new_indices = indices.slice();
    for (let r = 1; r < 5; r++) {
      new_indices[0] = mtable_o[new_indices[0]][m];
      new_indices[1] = mtable_p[new_indices[1]][m];
      let subpath_gen = phase4_ida_search_gen(
        new_indices,
        bound - 1,
        m,
        mtable_o,
        mtable_p,
        ptable_o,
        ptable_p,
        ptable_n,
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

/* Additional solving logic for the hybrid scrambler

Rather than being a purely random-move or random-state scramble (the former isn't random enough, but
the latter is too slow), we fully randomise the locations of the white pieces and of the grey pieces
then apply a bunch of random moves afterwards.

This is in the sense that the C(20,10,5,5) = 46558512 possible combinations of where the white, grey
and E-slice pieces are (without distinguishing between the white pieces, etc.) are equally likely.

Corner orientation is effectively randomised by doing at least 8 random moves on each hemisphere, so
for all intents and purposes, this should be as good as a random-state scramble.
*/

function generate_hs_mtable() {
  if (tables.hsm) {
    return tables.hsm;
  }
  const C20_5 = C(20, 5); // = 15504
  let mtable = Array(C20_5);
  for (let i = 0; i < C20_5; i++) {
    mtable[i] = Array(7);
    let comb = index_to_comb(i, 5, 20);
    for (let m = 0; m < 7; m++) {
      let new_comb = compose(comb, moves[m][0]);
      mtable[i][m] = comb_to_index(new_comb);
    }
  }
  return (tables.hsm = mtable);
}

function generate_hs_u_ptable() {
  if (tables.hsup) {
    return tables.hsup;
  }
  let mtable = generate_hs_mtable();
  return (tables.hsup = bfs(mtable, [15503]));
}

function generate_hs_d_ptable() {
  if (tables.hsdp) {
    return tables.hsdp;
  }
  let mtable = generate_hs_mtable();
  return (tables.hsdp = bfs(mtable, [0]));
}

function index_hs(state) {
  let p = state[0];
  return [
    comb_to_index(p.map((x) => +(x < 5))),
    comb_to_index(p.map((x) => +(x >= 15))),
  ];
}

// this is too unpredictably slow
// (obv we could generate a full pruning table, but that defeats the purpose of fast initialisation)
function solve_hs(state) {
  let mtables = Array(2).fill(generate_hs_mtable());
  let ptables = [generate_hs_u_ptable(), generate_hs_d_ptable()];
  return ida_solve(index_hs(state), mtables, ptables);
}

// this gives sequences ~2 moves longer on average, but is way faster
function solve_hs_twophase(state) {
  let mtable = generate_hs_mtable();
  let u_ptable = generate_hs_u_ptable();
  let d_ptable = generate_hs_d_ptable();
  let indices = index_hs(state);
  let sol1;
  /*
	if (u_ptable[indices[0]] < d_ptable[indices[1]]) sol1 = ida_solve([indices[0]], [mtable], [u_ptable]);
	else sol1 = ida_solve([indices[1]], [mtable], [d_ptable]);
	// don't do this because it'd give solutions starting with flip pretty often.
	*/
  sol1 = ida_solve([indices[1]], [mtable], [d_ptable]);
  let s1 = apply_move_sequence(state, sol1);
  let sol2 = ida_solve(index_hs(s1), [mtable, mtable], [u_ptable, d_ptable]);
  return sol1.concat(sol2);
}

function generate_hybrid_scramble() {
  let move_sequence = [];
  let sort_seq = solve_hs_twophase(random_state());
  for (let [m, r] of sort_seq) {
    let period = m === 6 ? 2 : 5;
    move_sequence.unshift([m, (period - r) % period]);
  }

  // TODO: remove possible move cancellations between the random-state and random-move phases
  return move_sequence.concat(generate_random_move_scramble(2, 9));
}

function generate_fullseparate_mtable() {
  if (tables.fsm) {
    return tables.fsm;
  }
  const C20_10 = C(20, 10); // = 184756
  const C19_9 = C(19, 9); // = 92378
  let moves12 = moves.slice(0, 6);
  moves12 = moves12.concat(
    moves12.map((move) => compose_o(compose_o(move_x2, move), move_x2)),
  );
  // get all 12 face moves by conjugating the six "top half" moves with a flip
  let moves15 = moves12.concat([move_x2, move_y, move_rot]);
  let mtable = Array(C20_10 * 2);
  let mtable15 = Array(C20_10 * 2);
  for (let i = 0; i < C20_10; i++) {
    mtable[i * 2] = Array(12);
    mtable[i * 2 + 1] = Array(12);
    mtable15[i * 2] = Array(15);
    mtable15[i * 2 + 1] = Array(15);
    let comb = index_to_comb(i, 10, 20);
    let perm = [];
    for (let j = 0, k = 0; j < 20; j++) {
      if (comb[j] === 0) {
        perm[j] = -1;
      } else {
        perm[j] = k++;
      }
    }
    for (let m = 0; m < 15; m++) {
      let new_perm = compose(perm, moves15[m][0]);
      let new_comb = compose(comb, moves15[m][0]);
      let parity = permutation_parity(new_perm.filter((x) => x >= 0));
      let I = comb_to_index(new_comb);
      mtable15[i * 2][m] = I * 2 + parity;
      mtable15[i * 2 + 1][m] = I * 2 + (parity ^ 1);
      if (m < 12) {
        mtable[i * 2][m] = I * 2 + parity;
        mtable[i * 2 + 1][m] = I * 2 + (parity ^ 1);
      }
    }
  }
  tables.fsm = mtable;
  tables.fsm15 = mtable15;
  return mtable;
}

function generate_fullseparate_ptable() {
  if (tables.fsp) {
    return tables.fsp;
  }
  let mtable = generate_fullseparate_mtable();
  /*
	let separations = [
		[0, 0, 0, 0, 0,  0, 0, 0, 0, 0,  1, 1, 1, 1, 1,  1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0,  1, 1, 0, 0, 0,  0, 0, 1, 1, 1,  1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0,  1, 1, 1, 1, 0,  0, 0, 0, 0, 1,  1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0,  0, 1, 1, 1, 1,  1, 0, 0, 0, 0,  1, 1, 1, 1, 1],
		[0, 0, 0, 0, 0,  0, 0, 0, 1, 1,  1, 1, 1, 0, 0,  1, 1, 1, 1, 1],
		[0, 0, 1, 1, 1,  0, 0, 0, 0, 1,  1, 1, 1, 1, 0,  1, 0, 0, 0, 1],
		[1, 0, 0, 1, 1,  1, 0, 0, 0, 0,  0, 1, 1, 1, 1,  0, 0, 0, 1, 1].map(x => 1-x),
		[1, 1, 0, 0, 1,  1, 1, 1, 0, 0,  0, 0, 0, 1, 1,  0, 0, 1, 1, 0].map(x => 1-x),
		[1, 1, 1, 0, 0,  1, 1, 1, 1, 1,  0, 0, 0, 0, 0,  0, 1, 1, 0, 0].map(x => 1-x),
		[0, 1, 1, 1, 0,  0, 0, 1, 1, 1,  1, 1, 0, 0, 0,  1, 1, 0, 0, 0],
	];
	*/
  let goal_states = [0];
  let l = 1;
  while (true) {
    for (let ind of goal_states) {
      for (let m = 12; m < 15; m++) {
        let new_ind = tables.fsm15[ind][m];
        if (goal_states.indexOf(new_ind) === -1) {
          goal_states.push(new_ind);
          goal_states.sort((x, y) => x - y); // slow but w/e
        }
      }
    }
    if (goal_states.length === l) {
      break;
    }
    l = goal_states.length;
  }
  print(goal_states.toSource());
  return (tables.fsp = bfs5(mtable, goal_states));
}

function bfs5(mtable, goal_states) {
  let N = mtable.length;
  let nmoves = mtable[0].length;
  let ptable = Array(N).fill(-1);
  let queue = goal_states.slice();
  let new_queue = [];
  let depth = 0;
  while (queue.length > 0) {
    new_queue.length = 0;
    for (let state of queue) {
      if (ptable[state] !== -1) {
        continue;
      }
      ptable[state] = depth;
      for (let move_index = 0; move_index < nmoves; move_index++) {
        let new_state = mtable[state][move_index];
        for (let r = 1; r <= 4; r++) {
          if (r === 1 || r === 4) {
            new_queue.push(new_state);
          }
          new_state = mtable[new_state][move_index];
        }
      }
    }
    [queue, new_queue] = [new_queue, queue];
    depth += 1;
  }
  return ptable;
}

export function getRandomKilominxScramble() {
  return new Alg(stringify_move_sequence(generate_random_state_scramble()));
}
