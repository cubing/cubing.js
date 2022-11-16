/* master pyraminx scramble generator */
// From https://gist.github.com/torchlight/9a5c53da09d8e090756a228f4b5f3471
// Added to `cubing.js` under the GPL license by permission from the author (@torchlight/xyzzy).

"use strict";

import { randomUIntBelow } from "random-uint-below";

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

function identity_permutation(n) {
  let a = Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = i;
  }
  return a;
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

let [evenpermutation12_to_index, index_to_evenpermutation12] = (() => {
  let index_in_set_bits = new Int8Array(4096 * 12);
  let look_up_set_bits = new Int8Array(4096 * 12);
  for (let i = 0; i < 4096; i++) {
    for (let j = 0, counter = 0; j < 12; j++) {
      if (((i >>> j) & 1) === 0) {
        continue;
      }
      index_in_set_bits[(j << 12) | i] = counter;
      look_up_set_bits[(counter << 12) | i] = j;
      counter++;
    }
  }

  function evenpermutation12_to_index(perm) {
    let unused = 0xfff; // track which values in 0..11 haven't been used so far
    let f = 19958400; // = 11!/2
    let ind = 0;
    for (let i = 0; i < 10; i++) {
      let v = perm[i];
      ind += index_in_set_bits[unused | (v << 12)] * f;
      unused &= ~(1 << v);
      f /= 11 - i;
    }
    return ind;
  }

  function index_to_evenpermutation12(ind, perm) {
    let unused = 0xfff;
    let f = 19958400; // = 11!/2
    let parity = 0;
    for (let i = 0; i < 10; i++) {
      let a = (ind / f) | 0;
      ind -= a * f;
      parity ^= a & 1;
      let v = look_up_set_bits[unused | (a << 12)];
      perm[i] = v;
      unused &= ~(1 << v);
      f /= 11 - i;
    }
    // the last two elements are uniquely determined by the other ten
    perm[10] = look_up_set_bits[unused | (parity << 12)];
    perm[11] = look_up_set_bits[unused | ((parity ^ 1) << 12)];
    return perm;
  }

  // these functions could be significantly faster with SWAR, but we can't SWAR here without 64-bit
  // bitwise ops. :<

  return [evenpermutation12_to_index, index_to_evenpermutation12];
})();

function compose(A, B) {
  let C = [];
  for (let i = 0; i < B.length; i++) {
    C[i] = A[B[i]];
  }
  return C;
}

function double_compose(A, B, C) {
  let D = [];
  for (let i = 0; i < C.length; i++) {
    D[i] = A[B[C[i]]];
  }
  return D;
}

function invert(perm) {
  let inv = [];
  for (let i = 0; i < perm.length; i++) {
    inv[perm[i]] = i;
  }
  return inv;
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

function permutation_from_cycles(cycles, n) {
  if (cycles.length === 0) {
    return identity_permutation(n);
  }
  return cycles
    .map((cycle) => permutation_from_cycle(cycle, n))
    .reduce(compose);
  // not very efficient, but this function is only called during init so it's fine
}

/* puzzle-specific stuff */

/*
We will (mostly) ignore the trivial tips here. When we say "single-layer", we mean one layer
*excluding* the tip, so it's really two layers on the physical puzzle; likewise, "double-layer"
means three layers on the physical puzzle. Hopefully this won't be too confusing.

Tips ("zero-layer" moves?) are written with a single lowercase letter: u, l, r, b.
Single-layer moves are written with a single uppercase letter: U, L, R, B.
Double-layer moves are written with a single uppercase letter and a w suffix: Uw, Lw, Rw, Bw.

The master pyraminx has four types of pieces:
- 4 corners (same as pyraminx); three orientations each (no permutation).
- 6 midges (same as pyraminx); even permutation, two orientations each, sum(orientations)%2 = 0.
- 12 wings; even permutation (no orientation).
- 4 centres; even permutation (no visible orientation).

The total number of states is (3^4) * (6!/2 * 2^5) * (12!/2) * (4!/2) = 2 681 795 837 952 000.

This is small enough that an optimal solver is feasible *if* we can use large pruning tables, but
if we want to keep init times short, a two-phase algorithm would be much better. Here, we will use a
two-phase reduction algorithm: the first phase reduces to a Halpern-Meier Pyramid / Jing's pyraminx,
and the second phase just solves that (using only double-layer moves).

Some ~group theory~ flexing: the alternating group A_4 (acting on the centres) has a copy of the
Klein four-group V as a normal subgroup of index 3. We can name the cosets (other than V itself) as
the cw coset if the elements are a clockwise 3-cycle (as viewed from a corner) and the ccw coset if
the elements are an anticlockwise 3-cycle. On the H-M pyra, (the name of) the V-coset of the centres
is exactly the sum of the orientations of the corners mod 3; this follows from V being a normal
subgroup of A_4.

---

In the first phase, we:
(i) do edge pairing (12!/2 ~ 2.4e8);
(ii) ensure the V-coset of the centres matches the corner orientations (3).

Relevant coordinates:
locations of a midge and its matching wings + centre stuff ((6*12*11) * 3 = 2376)

Pruning table:
- forming two tredges + centre stuff ((6*5*12*11*10*9) * 3 = 1069200)
- counting solved wings versus flipped wings + centre stuff (21 * 2 = 42)

The first pruning table takes around a quarter of a second to generate, which is kinda slow, but it
can't be helped. We check all fifteen possible pairs. (Checking only three pairs is enough, but has
very poor worst-case performance.)

The second pruning table takes literally an hour to generate, but it's also small so we just hard-
code all of its values instead of computing it on initialisation. Using this table kills off worst-
case behaviour on "bad" scrambles, but doesn't do a lot on "median" scrambles.

---

In the second phase, we solve the puzzle like a H-M pyra.

Relevant coordinates:
(i) edge permutation, location of yellow centre (6!/2 * 4 = 1440)
(ii) edge orientation, corner orientation (2^5 * 3^4 = 2592)

Corner orientation uniquely determines the V-coset of the centre permutation, and since V acts
sharply transitively on the centres, knowing where the yellow centre is uniquely determines which
element of that V-coset is the centre permutation.

---

Considerations for generating scrambles:

Tip scrambling: the standard pyraminx scramblers just put the tips at the end of the scramble. This
is *really bad* when we're doing the scrambles by hand and then immediately solving afterwards.
Ideally, the scramble sequence shouldn't reveal any obvious information about the scramble.

Like 333 and a few other puzzles, the states of a master pyra have a group structure, and so we can
take inverses. Once we have generated a random state, we can return either the inverse of its
solution, or the solution of its inverse. Since inversion preserves uniformity, we could just as
well just directly return a solution of a random state.

---

(ASCII nets modified from TNoodle's source code comments)

corners:

*           ____  ____                      ____  ____
*         /\    /\    /\                  /\    /\    /\
*        /3 \  /  \  /0 \       U        /0 \  /  \  /3 \
*       /____\/____\/____\     ____     /____\/____\/____\
*       \    /\    /\    /   /\    /\   \    /\    /\    /
*        \  /  \  /  \  /   /  \0 /  \   \  /  \  /  \  /
*         \/____\/____\/   /____\/____\   \/____\/____\/
*          \    /\    /   /\    /\    /\   \    /\    /
*           \  /1 \  /   /  \  /  \  /  \   \  /2 \  /
*            \/____\/   /____\/____\/____\   \/____\/
*                       \    /\    /\    /
*                        \1 /  \  /  \2 /
*                    L    \/____\/____\/    R
*
*                           ____  ____
*                         /\    /\    /\
*                        /1 \  /  \  /2 \
*                       /____\/____\/____\
*                       \    /\    /\    /
*                        \  /  \  /  \  /
*                         \/____\/____\/
*                          \    /\    /
*                           \  /3 \  /
*                            \/____\/
*
*                               B

midges:

*           ____  ____                      ____  ____
*         /\    /\    /\                  /\    /\    /\
*        /  \  /11\  /  \       U        /  \  /5 \  /  \
*       /____\/____\/____\     ____     /____\/____\/____\
*       \    /\    /\    /   /\    /\   \    /\    /\    /
*        \  /8 \  /7 \  /   /  \  /  \   \  /9 \  /10\  /
*         \/____\/____\/   /____\/____\   \/____\/____\/
*          \    /\    /   /\    /\    /\   \    /\    /
*           \  /  \  /   /  \1 /  \3 /  \   \  /  \  /
*            \/____\/   /____\/____\/____\   \/____\/
*                       \    /\    /\    /
*                        \  /  \0 /  \  /
*                    L    \/____\/____\/    R
*
*                           ____  ____
*                         /\    /\    /\
*                        /  \  /6 \  /  \
*                       /____\/____\/____\
*                       \    /\    /\    /
*                        \  /2 \  /4 \  /
*                         \/____\/____\/
*                          \    /\    /
*                           \  /  \  /
*                            \/____\/
*
*                               B

wings:

*           ____  ____                      ____  ____
*         /\    /\    /\                  /\    /\    /\
*        /  \5 /  \11/  \       U        /  \11/  \5 /  \
*       /____\/____\/____\     ____     /____\/____\/____\
*       \    /\    /\    /   /\    /\   \    /\    /\    /
*        \8 /  \  /  \1 /   /1 \  /9 \   \9 /  \  /  \4 /
*         \/____\/____\/   /____\/____\   \/____\/____\/
*          \    /\    /   /\    /\    /\   \    /\    /
*           \2 /  \7 /   /7 \  /  \  /3 \   \3 /  \10/
*            \/____\/   /____\/____\/____\   \/____\/
*                       \    /\    /\    /
*                        \  /0 \  /6 \  /
*                    L    \/____\/____\/    R
*
*                           ____  ____
*                         /\    /\    /\
*                        /  \0 /  \6 /  \
*                       /____\/____\/____\
*                       \    /\    /\    /
*                        \2 /  \  /  \10/
*                         \/____\/____\/
*                          \    /\    /
*                           \8 /  \4 /
*                            \/____\/
*
*                               B

centres:

*           ____  ____                      ____  ____
*         /\    /\    /\                  /\    /\    /\
*        /  \  /  \  /  \       U        /  \  /  \  /  \
*       /____\/____\/____\     ____     /____\/____\/____\
*       \    /\    /\    /   /\    /\   \    /\    /\    /
*        \  /  \2 /  \  /   /  \  /  \   \  /  \1 /  \  /
*         \/____\/____\/   /____\/____\   \/____\/____\/
*          \    /\    /   /\    /\    /\   \    /\    /
*           \  /  \  /   /  \  /3 \  /  \   \  /  \  /
*            \/____\/   /____\/____\/____\   \/____\/
*                       \    /\    /\    /
*                        \  /  \  /  \  /
*                    L    \/____\/____\/    R
*
*                           ____  ____
*                         /\    /\    /\
*                        /  \  /  \  /  \
*                       /____\/____\/____\
*                       \    /\    /\    /
*                        \  /  \0 /  \  /
*                         \/____\/____\/
*                          \    /\    /
*                           \  /  \  /
*                            \/____\/
*
*                               B

---

full state:
{
 co: int[4]: corner orientation (ccw twist = 1, cw twist = 2),
 mp: int[12]: midge facelet permutation (this encodes orientation as well),
 wp: int[12]: wing permutation,
 cp: int[4]: centre permutation
}

phase 1 state:
int[6]: locations of midge and matching wings + (CO - coset index) % 3

phase 2 state:
[
 int: edge permutation + yellow centre coordinate (0..1439),
 int: edge orientation + corner orientation coordinate (0..2591)
]
*/

function compose_state(state1, state2) {
  let co = Array(4);
  for (let i = 0; i < 4; i++) {
    co[i] = (state1.co[i] + state2.co[i]) % 3;
  }
  let mp = compose(state1.mp, state2.mp);
  let wp = compose(state1.wp, state2.wp);
  let cp = compose(state1.cp, state2.cp);
  return { co: co, mp: mp, wp: wp, cp: cp };
}

function invert_state(state) {
  let co = Array(4);
  for (let i = 0; i < 4; i++) {
    co[i] = (3 - state.co[i]) % 3;
  }
  let mp = invert(state.mp);
  let wp = invert(state.wp);
  let cp = invert(state.cp);
  return { co: co, mp: mp, wp: wp, cp: cp };
}

let solved = {
  co: [0, 0, 0, 0],
  mp: identity_permutation(12),
  wp: identity_permutation(12),
  cp: [0, 1, 2, 3],
};

// the single-layer moves don't affect midges (mp) or centres (cp)
let move_U = {
  co: [2, 0, 0, 0],
  mp: identity_permutation(12),
  wp: permutation_from_cycle([1, 9, 11], 12),
  cp: [0, 1, 2, 3],
};
let move_L = {
  co: [0, 2, 0, 0],
  mp: identity_permutation(12),
  wp: permutation_from_cycle([0, 7, 2], 12),
  cp: [0, 1, 2, 3],
};
let move_R = {
  co: [0, 0, 2, 0],
  mp: identity_permutation(12),
  wp: permutation_from_cycle([3, 6, 10], 12),
  cp: [0, 1, 2, 3],
};
let move_B = {
  co: [0, 0, 0, 2],
  mp: identity_permutation(12),
  wp: permutation_from_cycle([4, 8, 5], 12),
  cp: [0, 1, 2, 3],
};

// the double-layer moves affect everything, but permute the midges and wings identically
let move_Uw = {
  co: [2, 0, 0, 0],
  mp: permutation_from_cycles(
    [
      [1, 9, 11],
      [7, 3, 5],
    ],
    12,
  ),
  wp: permutation_from_cycles(
    [
      [1, 9, 11],
      [7, 3, 5],
    ],
    12,
  ),
  cp: [0, 2, 3, 1],
};
let move_Lw = {
  co: [0, 2, 0, 0],
  mp: permutation_from_cycles(
    [
      [0, 7, 2],
      [6, 1, 8],
    ],
    12,
  ),
  wp: permutation_from_cycles(
    [
      [0, 7, 2],
      [6, 1, 8],
    ],
    12,
  ),
  cp: [3, 1, 0, 2],
};
let move_Rw = {
  co: [0, 0, 2, 0],
  mp: permutation_from_cycles(
    [
      [3, 6, 10],
      [9, 0, 4],
    ],
    12,
  ),
  wp: permutation_from_cycles(
    [
      [3, 6, 10],
      [9, 0, 4],
    ],
    12,
  ),
  cp: [1, 3, 2, 0],
};
let move_Bw = {
  co: [0, 0, 0, 2],
  mp: permutation_from_cycles(
    [
      [4, 8, 5],
      [10, 2, 11],
    ],
    12,
  ),
  wp: permutation_from_cycles(
    [
      [4, 8, 5],
      [10, 2, 11],
    ],
    12,
  ),
  cp: [2, 0, 1, 3],
};

let moves = [
  move_Uw,
  move_Lw,
  move_Rw,
  move_Bw,
  move_U,
  move_L,
  move_R,
  move_B,
];
let move_names = ["u", "l", "r", "b", "U", "L", "R", "B"];
const N_MOVES = 8; // number of moves
const N_MOVES_PHASE2 = 4; // number of moves for phase 2

function moves_commute(i, j) {
  // single-layer moves always commute with each other
  if (i >= 4 && j >= 4) {
    return true;
  }
  // double-layer moves commute iff they are equal
  if (i < 4 && j < 4) {
    return i === j;
  }
  // a single-layer and a double-layer move commute iff they're on the same axis
  return (i ^ j) === 4;
}

function apply_move_sequence(state, move_sequence) {
  for (let [m, r] of move_sequence) {
    for (let i = 0; i < r; i++) {
      state = compose_state(state, moves[m]);
    }
  }
  return state;
}

function stringify_move_sequence(move_sequence) {
  let suffixes = ["0", "", "'"];
  let s = move_sequence.map(([m, r]) => move_names[m] + suffixes[r]);
  return s.join(" ");
}

function print_move_sequence(move_sequence) {
  console.log(stringify_move_sequence(move_sequence));
}

function generate_random_state() {
  // master pyra has no "nontrivial" restrictions, beyond the usual parity stuff
  let co = Array(4);
  for (let i = 0; i < 4; i++) {
    co[i] = randomUIntBelow(3);
  }
  let mp = index_to_evenpermutation(randomUIntBelow(factorial(6) / 2), 6);
  for (let i = 0, parity = 0; i < 6; i++) {
    let eo = i === 5 ? parity : randomUIntBelow(2);
    parity ^= eo;
    mp[i] += eo * 6;
    mp[i + 6] = (mp[i] + 6) % 12;
  }
  let wp = index_to_evenpermutation(randomUIntBelow(factorial(12) / 2), 12);
  let cp = index_to_evenpermutation(randomUIntBelow(factorial(4) / 2), 4);
  return { co: co, mp: mp, wp: wp, cp: cp };
}

function generate_random_state_scramble() {
  return solve(generate_random_state(randomUIntBelow));
}

function generate_scramble_sequence(tips = true, obfuscate_tips = false) {
  let scramble_string = stringify_move_sequence(
    generate_random_state_scramble(),
  );
  if (!tips) {
    return scramble_string;
  }
  let tip_names = ["u", "l", "r", "b"];
  let suffixes = ["0", "", "'"];
  if (!obfuscate_tips) {
    for (let i = 0; i < 4; i++) {
      let x = randomUIntBelow(3);
      if (x !== 0) {
        scramble_string += ` ${tip_names[i]}${suffixes[x]}`;
      }
    }
    return scramble_string.trim();
  }
  let amount = [];
  let amount_pre = [];
  let amount_post = [];
  for (let i = 0; i < 4; i++) {
    amount[i] = randomUIntBelow(3);
    amount_pre[i] = randomUIntBelow(3);
    amount_post[i] = (amount[i] - amount_pre[i] + 3) % 3;
  }
  let weight = (arr) => arr.filter((x) => x !== 0).length;
  while (
    !(
      weight(amount_pre) >= 1 &&
      weight(amount_post) >= 1 &&
      weight(amount_pre) + weight(amount_post) >= 4
    )
  ) {
    for (let i = 0; i < 4; i++) {
      amount_pre[i] = randomUIntBelow(3);
      amount_post[i] = (amount[i] - amount_pre[i] + 3) % 3;
    }
  }
  let prepend = amount_pre
    .map((x, i) => (x !== 0 ? `${tip_names[i]}${suffixes[x]} ` : ""))
    .join("");
  let append = amount_post
    .map((x, i) => (x !== 0 ? ` ${tip_names[i]}${suffixes[x]}` : ""))
    .join("");
  return prepend + scramble_string + append;
  // this technically has the extremely edge case of the original no-tip scramble being the
  // trivial scramble and the resulting string will have a double space, but this is Very Rare
}

function solve(state) {
  let phase1_indices = index_phase1(state);
  let phase2_mtables = [
    generate_phase2_permutation_mtable(),
    generate_phase2_orientation_mtable(),
  ];
  let phase2_ptables = [
    generate_phase2_permutation_ptable(),
    generate_phase2_orientation_ptable(),
  ];

  let phase1gen = phase1_ida_solve_gen(phase1_indices);
  let best = undefined;
  let intermediate_states = new Set();
  let start_time = performance.now();
  for (let i = 0; i < 22; i++) {
    let { value: sol1, done } = phase1gen.next();
    let new_state = state;
    for (let [m, r] of sol1) {
      for (let i = 0; i < r; i++) {
        new_state = compose_state(new_state, moves[m]);
      }
    }
    let stringified_state = JSON.stringify(new_state);
    if (intermediate_states.has(stringified_state)) {
      // console.log("skip");
      continue;
    } else {
      intermediate_states.add(stringified_state);
    }
    let phase2_indices = index_phase2(new_state);
    //let sol2 = [];
    let moves_left = best ? best.length - sol1.length - 1 : 999999;
    let sol2 = ida_solve_gen(
      phase2_indices,
      phase2_mtables,
      phase2_ptables,
      moves_left,
    ).next().value;
    if (sol2 === undefined) {
      // console.log("prune");
      continue;
    }
    // console.log(
    //   `to ${stringified_state} in ${sol1.length} moves; total move count ${
    //     sol1.length + sol2.length
    //   }`,
    // );
    if (best === undefined || best.length > sol1.length + sol2.length) {
      best = sol1.concat(sol2);
    }
    // bail if we've spent too much time
    if (performance.now() - start_time > 300) {
      break;
    }
  }
  return best;
}

function determine_V_coset(p) {
  // p: even permutation on 4 elements
  // NOTE: the formula depends on the centre ordering and corner orientation conventions
  // V itself is 0, ccw coset is 1, cw coset is 2.
  return p[3 ^ p.indexOf(3)];
}

function index_phase1(state) {
  let w = compose(invert(state.mp), state.wp);
  let c =
    (state.co.reduce((x, y) => x + y) - determine_V_coset(state.cp) + 3) % 3;
  return [0, 1, 2, 3, 4, 5].map(
    (i) => i + 6 * w.indexOf(i) + 72 * w.indexOf(i + 6) + 864 * c,
  );
}

let phase1_permtable_m = [];
let phase1_permtable_minv = [];
let phase1_permtable_w = [];
let phase1_permtable_winv = [];
for (let i = 0; i < N_MOVES; i++) {
  let move = moves[i];
  phase1_permtable_m[i] = move.mp;
  phase1_permtable_minv[i] = invert(move.mp);
  phase1_permtable_w[i] = move.wp;
  phase1_permtable_winv[i] = invert(move.wp);
}
let phase1_c_update = [0, 0, 0, 0, 2, 2, 2, 2];

/* score = (# matching wings - # flipped wings) + 12
(the +12 is to make it have range 0..24 rather than -12..12)

this is more effective than looking at # matching wings alone, or # flipped wings alone.

stats for centre/corner solved:
js> num_by_score
[1, 0, 0, 320, 1350, 11328, 77280, 422400, 2016735, 7808000, 23467296, 50855040, 70181300, 50855040, 23467296, 7808000, 2016735, 422400, 77280, 11328, 1350, 320, 0, 0, 1]
js> min_by_score
[14, 9999, 9999, 11, 11, 10, 9, 8, 8, 7, 7, 6, 4, 5, 5, 3, 4, 4, 2, 3, 4, 3, 9999, 9999, 0]
js> max_by_score
[14, -9999, -9999, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 11, 10, 10, 10, 9, 8, 8, 5, -9999, -9999, 0]
js> sum_by_score
[14, 0, 0, 3856, 16458, 131856, 904280, 4885752, 23019405, 87454032, 256924344, 542481888, 725249936, 501317616, 218566356, 67825352, 16313334, 3116472, 509352, 63600, 7854, 1288, 0, 0, 0]

stats for centre/corner unsolved:
js> min_by_score
[13, 9999, 9999, 11, 10, 10, 9, 8, 8, 7, 7, 6, 4, 5, 5, 3, 4, 4, 2, 3, 3, 1, 9999, 9999, 6]
js> max_by_score
[13, -9999, -9999, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 12, 11, 11, 10, 9, 9, 8, 8, 6, -9999, -9999, 6]
js> sum_by_score
[13, 0, 0, 3792, 16026, 133344, 900726, 4870308, 23008797, 87434932, 256859772, 542586948, 725077315, 501101484, 218802804, 67943128, 16250601, 3110148, 509044, 65940, 7284, 1148, 0, 0, 6]

*/

let phase1_score_ptable = [
  //-12        -9  -8  -7 -6 -5 -4 -3 -2 -1  0  1  2  3  4  5  6  7  8  9         12
  [
    14, -1, -1, 11, 11, 10, 9, 8, 8, 7, 7, 6, 4, 5, 5, 3, 4, 4, 2, 3, 4, 3, -1,
    -1, 0,
  ],
  [
    13, -1, -1, 11, 10, 10, 9, 8, 8, 7, 7, 6, 4, 5, 5, 3, 4, 4, 2, 3, 3, 1, -1,
    -1, 6,
  ],
];
let phase1_score_ptable_condensed = new Int8Array(55);
for (let i = 0; i < 25; i++) {
  phase1_score_ptable_condensed[i] = phase1_score_ptable[0][i];
  phase1_score_ptable_condensed[i + 30] = phase1_score_ptable[1][i];
}
let phase1_coord_to_score = new Int8Array(6 * 12 * 12 * 3);
for (let i = 0; i < 6; i++) {
  for (let j = 0; j < 12; j++) {
    for (let k = 0; k < 12; k++) {
      let index = i + 6 * j + 72 * k;
      let score = 2;
      if (j === i) {
        score++;
      } else if (j === (i + 6) % 12) {
        score--;
      }
      if (k === (i + 6) % 12) {
        score++;
      } else if (k === i) {
        score--;
      }
      phase1_coord_to_score[index] = score;
      phase1_coord_to_score[index + 6 * 12 * 12] = phase1_coord_to_score[
        index + 2 * 6 * 12 * 12
      ] = score + 5;
    }
  }
}

function phase1_benchmark() {
  /* some 13-move phase 1 states*/
  let phase1_test_states = [
    [1836, 2551, 1922, 1947, 2440, 2063],
    [1674, 1153, 1058, 1353, 1000, 1271],
    [1764, 2497, 1904, 2001, 2242, 2087],
    [582, 301, 566, 273, 40, 431],
    [600, 217, 200, 477, 136, 431],
    [60, 613, 98, 273, 214, 407],
    [36, 265, 98, 777, 190, 431],
    [1764, 1987, 2402, 1881, 2368, 2159],
    [36, 277, 194, 129, 334, 431],
    [1764, 1843, 1928, 2499, 2158, 2039],
    [528, 721, 194, 429, 112, 275],
    [840, 115, 182, 219, 346, 425],
    [1752, 1831, 2498, 1989, 2416, 1943],
    [324, 133, 554, 231, 58, 431],
    [18, 331, 194, 495, 658, 431],
    [1764, 1987, 1880, 2337, 2578, 2081],
    [1776, 1855, 1934, 1989, 2050, 2231],
    [396, 811, 194, 297, 712, 47],
    [816, 115, 482, 273, 148, 425],
    [972, 907, 1070, 1281, 1174, 1511],
  ];
  generate_phase1_pairing2c_ptable();
  let start = performance.now();
  for (let coords of phase1_test_states) {
    phase1_ida_solve_gen(coords).next();
  }
  return performance.now() - start;
}

function* phase1_ida_solve_gen(coords) {
  let bound = 0;
  let mtable = generate_phase1_pairingc_mtable();
  let ptable = generate_phase1_pairing2c_ptable();
  while (true) {
    yield* phase1_ida_search_gen(...coords, mtable, ptable, bound, -1);
    bound++;
  }
}

function* phase1_ida_search_gen(a, b, c, d, e, f, mtable, ptable, bound, last) {
  let nmoves = N_MOVES; // = 8
  let score =
    phase1_coord_to_score[a] +
    phase1_coord_to_score[b] +
    phase1_coord_to_score[c] +
    phase1_coord_to_score[d] +
    phase1_coord_to_score[e] +
    phase1_coord_to_score[f];
  let heuristic = Math.max(
    ptable[(a % 864) + b * 864],
    ptable[(c % 864) + b * 864],
    ptable[(e % 864) + b * 864],
    ptable[(a % 864) + d * 864],
    ptable[(c % 864) + d * 864],
    ptable[(e % 864) + d * 864],
    ptable[(a % 864) + f * 864],
    ptable[(c % 864) + f * 864],
    ptable[(e % 864) + f * 864],
    ptable[(a % 864) + c * 864],
    ptable[(a % 864) + e * 864],
    ptable[(c % 864) + e * 864],
    ptable[(b % 864) + d * 864],
    ptable[(b % 864) + f * 864],
    ptable[(d % 864) + f * 864],
    phase1_score_ptable_condensed[score],
  );
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
    if (m < last && moves_commute(m, last)) {
      continue;
    }
    let A = a;
    let B = b;
    let C = c;
    let D = d;
    let E = e;
    let F = f;
    for (let r = 1; r <= 2; r++) {
      A = mtable[A][m];
      B = mtable[B][m];
      C = mtable[C][m];
      D = mtable[D][m];
      E = mtable[E][m];
      F = mtable[F][m];
      let subpath_gen = phase1_ida_search_gen(
        A,
        B,
        C,
        D,
        E,
        F,
        mtable,
        ptable,
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

function index_phase2(state) {
  let edges = state.mp;
  let ep = evenpermutation_to_index(edges.slice(0, 6).map((x) => x % 6));
  let eo = edges
    .slice(0, 5)
    .map((x, i) => (x >= 6) * 2 ** i)
    .reduce((x, y) => x + y);
  let co = state.co.map((x, i) => x * 3 ** i).reduce((x, y) => x + y);
  let cloc = state.cp.indexOf(0);
  return [ep + 360 * cloc, eo + 32 * co];
}

let tables = {};

function generate_phase1_pairing_mtable() {
  if (tables.phase1pm) {
    return tables.phase1pm;
  }
  let mtable = Array(6 * 12 * 12)
    .fill()
    .map(() => Array(N_MOVES).fill(-1));
  for (let midge = 0; midge < 6; midge++) {
    for (let wingl = 0; wingl < 12; wingl++) {
      for (let wingh = 0; wingh < 12; wingh++) {
        if (wingl === wingh) {
          continue;
        }
        let index = midge + 6 * wingl + 72 * wingh;
        for (let m = 0; m < N_MOVES; m++) {
          let new_midge = phase1_permtable_minv[m][midge];
          let new_wingl = phase1_permtable_winv[m][wingl];
          let new_wingh = phase1_permtable_winv[m][wingh];
          if (new_midge < 6) {
            mtable[index][m] = new_midge + 6 * new_wingl + 72 * new_wingh;
          } else {
            mtable[index][m] = new_midge - 6 + 6 * new_wingh + 72 * new_wingl;
          }
        }
      }
    }
  }
  return (tables.phase1pm = mtable);
}

function generate_phase1_pairingc_mtable() {
  if (tables.phase1pcm) {
    return tables.phase1pcm;
  }
  let mtable_pairing = generate_phase1_pairing_mtable();
  let mtable = Array(mtable_pairing.length * 3)
    .fill()
    .map(() => Array(N_MOVES).fill(-1));
  for (let index = 0; index < mtable_pairing.length; index++) {
    for (let m = 0; m < N_MOVES; m++) {
      let new_index = mtable_pairing[index][m];
      mtable[index][m] = new_index + 6 * 12 * 12 * phase1_c_update[m];
      mtable[index + 6 * 12 * 12][m] =
        new_index + 6 * 12 * 12 * ((phase1_c_update[m] + 1) % 3);
      mtable[index + 2 * 6 * 12 * 12][m] =
        new_index + 6 * 12 * 12 * ((phase1_c_update[m] + 2) % 3);
    }
  }
  return (tables.phase1pcm = mtable);
}

function generate_phase1_pairing2c_ptable() {
  if (tables.phase1p2cp) {
    return tables.phase1p2cp;
  }
  let mtable_noc = generate_phase1_pairing_mtable();
  let mtable = generate_phase1_pairingc_mtable();
  let ptable = new Int8Array((6 * 12 * 12) ** 2 * 3);
  ptable.fill(-1);
  let g = [0, 1, 2, 3, 4, 5].map((x) => x + 6 * x + 72 * (x + 6));
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (i === j) {
        continue;
      }
      ptable[g[i] + 864 * g[j]] = 0;
    }
  }
  let dist = 0;
  while (true) {
    let changed = false;
    for (let index = 0; index < ptable.length; index++) {
      if (ptable[index] !== dist) {
        continue;
      }
      let index0 = index % 864;
      let index1 = Math.floor(index / 864);
      for (let m = 0; m < N_MOVES; m++) {
        let new_index0 = index0;
        let new_index1 = index1;
        for (let r = 1; r <= 2; r++) {
          new_index0 = mtable_noc[new_index0][m];
          new_index1 = mtable[new_index1][m];
          let new_index = new_index0 + 864 * new_index1;
          if (ptable[new_index] === -1) {
            changed = true;
            ptable[new_index] = dist + 1;
          }
        }
      }
    }
    if (!changed) {
      break;
    }
    dist++;
  }
  return (tables.phase1p2cp = ptable);
}

function generate_phase1_full_ptable() {
  // extremely slow, do not use
  if (tables.phase1p) {
    return tables.phase1p;
  }
  const HALFFACT12 = factorial(12) / 2;
  const SIZE = HALFFACT12 * 3;
  let ptable = new Int8Array(SIZE).fill(-1);
  ptable[0] = 0;
  let dist = 0;
  let perm = new Int8Array(12);
  let new_perm = new Int8Array(12);
  while (true) {
    let changed = false;
    let count = 0;
    for (let index = 0; index < SIZE; index++) {
      if (ptable[index] !== dist) {
        continue;
      }
      count++;
      let cindex = index % 3;
      let windex = (index - cindex) / 3;
      index_to_evenpermutation12(windex, perm);
      for (let m = 0; m < N_MOVES; m++) {
        let move_m = phase1_permtable_m[m];
        let move_minv = phase1_permtable_minv[m];
        let move_w = phase1_permtable_w[m];
        let move_winv = phase1_permtable_winv[m];
        {
          // clockwise move
          let new_cindex = (cindex + phase1_c_update[m]) % 3;
          for (let i = 0; i < 12; i++) {
            new_perm[i] = move_minv[perm[move_w[i]]];
          }
          let new_windex = evenpermutation12_to_index(new_perm);
          let new_index = new_cindex + 3 * new_windex;
          if (ptable[new_index] === -1) {
            changed = true;
            ptable[new_index] = dist + 1;
          }
        }
        {
          // anticlockwise move
          let new_cindex = (cindex + 3 - phase1_c_update[m]) % 3;
          for (let i = 0; i < 12; i++) {
            new_perm[i] = move_m[perm[move_winv[i]]];
          }
          let new_windex = evenpermutation12_to_index(new_perm);
          let new_index = new_cindex + 3 * new_windex;
          if (ptable[new_index] === -1) {
            changed = true;
            ptable[new_index] = dist + 1;
          }
        }
      }
    }
    console.log(`${count} nodes at depth ${dist}`);
    if (!changed) {
      break;
    }
    dist++;
  }
  return (tables.phase1p = ptable);
}

function generate_phase2_permutation_mtable() {
  if (tables.phase2pm) {
    return tables.phase2pm;
  }
  let mtable = Array(1440)
    .fill()
    .map(() => Array(N_MOVES_PHASE2));
  for (let ep = 0; ep < 360; ep++) {
    let perm = index_to_evenpermutation(ep, 6);
    // fill in the "opposite" values
    for (let i = 0; i < 6; i++) {
      perm[i + 6] = perm[i] + 6;
    }
    for (let m = 0; m < N_MOVES_PHASE2; m++) {
      let new_perm = compose(perm, moves[m].mp);
      let new_ep = evenpermutation_to_index(
        new_perm.slice(0, 6).map((x) => x % 6),
      );
      for (let new_cloc = 0; new_cloc < 4; new_cloc++) {
        let cloc = moves[m].cp[new_cloc];
        mtable[ep + 360 * cloc][m] = new_ep + 360 * new_cloc;
      }
    }
  }
  return (tables.phase2pm = mtable);
}

function generate_phase2_orientation_mtable() {
  if (tables.phase2om) {
    return tables.phase2om;
  }
  let mtable = Array(32 * 81)
    .fill()
    .map(() => Array(N_MOVES_PHASE2));
  for (let eo = 0; eo < 32; eo++) {
    let eo_array = [0, 1, 2, 3, 4].map((i) => (eo >> i) & 1);
    eo_array[5] = eo_array.reduce((x, y) => x ^ y);
    let perm = [];
    for (let i = 0; i < 6; i++) {
      perm[i] = i + 6 * eo_array[i];
      perm[i + 6] = i + 6 * (eo_array[i] ^ 1);
    }
    for (let co = 0; co < 81; co++) {
      let co_array = [0, 1, 2, 3].map((i) => Math.floor(co / 3 ** i) % 3);
      for (let m = 0; m < N_MOVES_PHASE2; m++) {
        let new_perm = compose(perm, moves[m].mp);
        let new_eo_array = new_perm.slice(0, 5).map((x) => +(x >= 6));
        let new_eo = 0;
        for (let i = 0; i < 5; i++) {
          new_eo += new_eo_array[i] << i;
        }
        let new_co_array = co_array.map((x, i) => (x + moves[m].co[i]) % 3);
        let new_co = 0;
        for (let i = 0; i < 4; i++) {
          new_co += new_co_array[i] * 3 ** i;
        }
        mtable[eo + 32 * co][m] = new_eo + 32 * new_co;
      }
    }
  }
  return (tables.phase2om = mtable);
}

function generate_phase2_permutation_ptable() {
  if (tables.phase2pp) {
    return tables.phase2pp;
  }
  return (tables.phase2pp = bfs(generate_phase2_permutation_mtable(), [0]));
}

function generate_phase2_orientation_ptable() {
  if (tables.phase2op) {
    return tables.phase2op;
  }
  return (tables.phase2op = bfs(generate_phase2_orientation_mtable(), [0]));
}

function bfs(mtable, goal_states) {
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
        while (new_state !== state) {
          new_queue.push(new_state);
          new_state = mtable[new_state][move_index];
        }
      }
    }
    [queue, new_queue] = [new_queue, queue];
    depth += 1;
  }
  return ptable;
}

function* ida_solve_gen(indices, mtables, ptables, moves_left) {
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (bound <= moves_left) {
    yield* ida_search_gen(indices, mtables, ptables, bound, -1);
    bound++;
  }
}

function* ida_search_gen(indices, mtables, ptables, bound, last) {
  let ncoords = indices.length;
  let nmoves = mtables[0][0].length;
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
    if (m < last && moves_commute(m, last)) {
      continue;
    }
    let new_indices = indices.slice();
    for (let c = 0; c < ncoords; c++) {
      new_indices[c] = mtables[c][indices[c]][m];
    }
    let r = 1;
    while (indices.some((_, i) => indices[i] !== new_indices[i])) {
      let subpath_gen = ida_search_gen(
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
      for (let c = 0; c < ncoords; c++) {
        new_indices[c] = mtables[c][new_indices[c]][m];
      }
      r++;
    }
  }
}

export async function randomMasterTetraminxScrambleString() {
  return generate_scramble_sequence(false);
}
