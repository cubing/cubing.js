/* Redi cube scramble generator */
// From https://torchlight.github.io/rediscrambler.js
// Added to `cubing.js` under the GPL license by permission from the author (@torchlight/xyzzy).

"use strict";

import { Alg } from "../../../alg";
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
  // could probably use some kind of binary tree to make this linearithmic, but I am hella lazy.
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
  // again, there is a linearithmic algorithm to count inversions, but >lazy
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

function compose_state(state1, state2) {
  let o = Array(8).fill(0);
  for (let i = 0; i < 8; i++) {
    o[i] = (state1[1][i] + state2[1][i]) % 3;
  }
  return [compose(state1[0], state2[0]), o];
}

let move_UL = [
  permutation_from_cycle([0, 1, 4], 12),
  unsparsify_list({ 0: 2 }, 8),
];
let move_U = [
  permutation_from_cycle([1, 2, 5], 12),
  unsparsify_list({ 1: 2 }, 8),
];
let move_UR = [
  permutation_from_cycle([2, 3, 6], 12),
  unsparsify_list({ 2: 2 }, 8),
];
let move_F = [
  permutation_from_cycle([3, 0, 7], 12),
  unsparsify_list({ 3: 2 }, 8),
];
let move_L = [
  permutation_from_cycle([9, 8, 4], 12),
  unsparsify_list({ 4: 2 }, 8),
];
let move_B = [
  permutation_from_cycle([10, 9, 5], 12),
  unsparsify_list({ 5: 2 }, 8),
];
let move_R = [
  permutation_from_cycle([11, 10, 6], 12),
  unsparsify_list({ 6: 2 }, 8),
];
let move_D = [
  permutation_from_cycle([8, 11, 7], 12),
  unsparsify_list({ 7: 2 }, 8),
];

let solved = [index_to_permutation(0, 12), Array(8).fill(0)];

let moves = [move_UL, move_U, move_UR, move_F, move_L, move_B, move_R, move_D];
let move_names = ["UL", "U", "UR", "F", "L", "B", "R", "D"];
let tetrad = [0, 1, 0, 1, 1, 0, 1, 0];

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
  let p = index_to_evenpermutation(
    Math.floor(randomUIntBelow(factorial(12)) / 2),
    12,
  );
  let o = Array(8);
  for (let i = 0; i < 8; i++) {
    o[i] = randomUIntBelow(3);
  }
  return [p, o];
}

function generate_random_state_scramble() {
  return solve(generate_random_state());
}

function generate_scramble_sequence() {
  return stringify_move_sequence(generate_random_state_scramble());
}

function solve(state) {
  let phase1_indices = index_phase1(state);
  let phase1_mtables = [
    generate_phase1_edge_mtable(),
    generate_phase1_separate_mtable(),
  ];
  let phase1_ptables = [
    generate_phase1_edge_ptable(),
    generate_phase1_separate_ptable(),
  ];
  let phase2_mtables = [
    generate_phase2_edge_mtable(),
    generate_phase2_corner_mtable(),
  ];
  let phase2_ptables = [
    generate_phase2_edge_ptable(),
    generate_phase1_corner_ptable(),
  ];

  let phase1gen = ida_solve_gen(phase1_indices, phase1_mtables, phase1_ptables);
  let best = undefined;
  let intermediate_states = new Set();
  let start_time = +new Date();
  for (let i = 0; i < 25; i++) {
    let { value: sol1, done } = phase1gen.next();
    let new_state = state;
    for (let [m, r] of sol1) {
      for (let i = 0; i < r; i++) {
        new_state = compose_state(new_state, moves[m]);
      }
    }
    if (intermediate_states.has(new_state.toString())) {
      // console.log("skip");
      continue;
    } else {
      intermediate_states.add(new_state.toString());
    }
    let edge_ind = evenpermutation_to_index(new_state[0].slice(0, 8));
    let corner_ind = 0;
    for (let i = 0; i < 4; i++) {
      corner_ind += new_state[1][i] * 3 ** i;
    }
    let phase2_indices = [edge_ind, corner_ind];
    //let sol2 = [];
    let moves_left = best ? best.length - sol1.length - 1 : 999999;
    let sol2 = ida_solve(
      phase2_indices,
      phase2_mtables,
      phase2_ptables,
      moves_left,
    );
    if (sol2 === undefined) {
      // console.log("prune");
      continue;
    }
    // console.log(
    //   `to ${new_state} in ${sol1.length} moves; total move count ${
    //     sol1.length + sol2.length
    //   }`,
    // );
    if (best === undefined || best.length > sol1.length + sol2.length) {
      best = sol1.concat(sol2);
    }
    // bail if we've spent too much time
    if (new Date() - start_time > 300) {
      break;
    }
  }
  return best;
}

function index_phase1(state) {
  let edge_ind = 0;
  for (let i = 0; i < 4; i++) {
    edge_ind += state[0].indexOf(i + 8) * 12 ** i;
  }
  let corner_ind = 0;
  for (let i = 0; i < 4; i++) {
    corner_ind += state[1][i + 4] * 3 ** i;
  }
  let filtered = state[0].map((x) => Math.max(-1, x - 8));
  let separate_ind =
    comb_to_index(filtered.map((x) => +(x >= 0))) * 2 +
    permutation_parity(filtered.filter((x) => x >= 0));
  return [edge_ind, corner_ind + 81 * separate_ind];
}

let tables = {};

function generate_phase1_corner_mtable() {
  if (tables.phase1cm) {
    return tables.phase1cm;
  }
  let mtable = [];
  for (let i = 0; i < 81; i++) {
    mtable[i] = Array(8);
    let o = [
      i % 3,
      Math.floor(i / 3) % 3,
      Math.floor(i / 9) % 3,
      Math.floor(i / 27),
    ];
    mtable[i][0] = mtable[i][1] = mtable[i][2] = mtable[i][3] = i;
    for (let j = 0; j < 4; j++) {
      o[j] = (o[j] + 2) % 3;
      mtable[i][4 + j] = o[0] + o[1] * 3 + o[2] * 9 + o[3] * 27;
      o[j] = (o[j] + 1) % 3;
    }
  }
  return (tables.phase1cm = mtable);
}

function generate_phase1_corner_ptable() {
  if (tables.phase1cp) {
    return tables.phase1cp;
  }
  let ptable = Array(81);
  for (let i = 0; i < 81; i++) {
    let o = [
      i % 3,
      Math.floor(i / 3) % 3,
      Math.floor(i / 9) % 3,
      Math.floor(i / 27),
    ];
    ptable[i] = (o[0] !== 0) + (o[1] !== 0) + (o[2] !== 0) + (o[3] !== 0);
  }
  return (tables.phase1cp = ptable);
}

function generate_phase1_edge_mtable() {
  if (tables.phase1em) {
    return tables.phase1em;
  }
  let mtable_single = [];
  for (let i = 0; i < 12; i++) {
    mtable_single[i] = [];
    for (let m = 0; m < 8; m++) {
      mtable_single[i][m] = moves[m][0].indexOf(i);
    }
  }
  let mtable = Array(12 ** 4);
  for (let i = 0; i < 12 ** 4; i++) {
    mtable[i] = Array(8);
    for (let m = 0; m < 8; m++) {
      let I = 0;
      for (let j = 0; j < 4; j++) {
        I += mtable_single[Math.floor(i / 12 ** j) % 12][m] * 12 ** j;
      }
      mtable[i][m] = I;
    }
  }
  return (tables.phase1em = mtable);
}

function generate_phase1_edge_ptable() {
  if (tables.phase1ep) {
    return tables.phase1ep;
  }
  return (tables.phase1ep = bfs(generate_phase1_edge_mtable(), [
    8 + 12 * (9 + 12 * (10 + 12 * 11)),
  ]));
}

function generate_phase1_separate_mtable() {
  if (tables.phase1sm) {
    return tables.phase1sm;
  }
  const C12_4 = C(12, 4);
  let mtable_c = [];
  for (let i = 0; i < C12_4; i++) {
    mtable_c[i] = [];
    let comb = index_to_comb(i, 4, 12);
    let perm = [];
    for (let j = 0, k = 0; j < 12; j++) {
      if (comb[j] === 0) {
        perm[j] = -1;
      } else {
        perm[j] = k++;
      }
    }
    for (let m = 0; m < 8; m++) {
      let new_perm = compose(perm, moves[m][0]);
      let new_comb = compose(comb, moves[m][0]);
      let parity = permutation_parity(new_perm.filter((x) => x >= 0));
      mtable_c[i][m] = comb_to_index(new_comb) * 2 + parity;
    }
  }
  let mtable_co = generate_phase1_corner_mtable();
  let mtable = [];
  for (let j = 0; j < C12_4; j++) {
    for (let i = 0; i < 81; i++) {
      let m0 = (mtable[i + 81 * (2 * j)] = []);
      let m1 = (mtable[i + 81 * (2 * j + 1)] = []);
      for (let m = 0; m < 8; m++) {
        m0[m] = mtable_co[i][m] + 81 * mtable_c[j][m];
        m1[m] = mtable_co[i][m] + 81 * (mtable_c[j][m] ^ 1);
      }
    }
  }
  return (tables.phase1sm = mtable);
}

function generate_phase1_separate_ptable() {
  if (tables.phase1sp) {
    return tables.phase1sp;
  }
  return (tables.phase1sp = bfs(generate_phase1_separate_mtable(), [0]));
}

function generate_phase2_corner_mtable() {
  if (tables.phase2cm) {
    return tables.phase2cm;
  }
  let phase1_mtable = generate_phase1_corner_mtable();
  let mtable = Array(81);
  for (let i = 0; i < 81; i++) {
    mtable[i] = phase1_mtable[i].slice(4, 8);
  }
  return (tables.phase2cm = mtable);
}

function generate_phase2_edge_mtable() {
  if (tables.phase2em) {
    return tables.phase2em;
  }
  const n = 8;
  const HALFFACT8 = factorial(n) / 2;
  let mtable = Array(HALFFACT8);
  let perm = [0, 1, 2, 3, 4, 5, 6, 7];
  for (let i = 0; i < HALFFACT8; i++) {
    //perm = index_to_evenpermutation(i, 8);
    mtable[i] = Array(4);
    for (let m = 0; m < 4; m++) {
      let new_perm = compose(perm, moves[m][0].slice(0, 8));
      mtable[i][m] = evenpermutation_to_index(new_perm);
    }

    if (i === HALFFACT8 - 1) {
      break;
    }
    // update perm to lex-next even permutation
    let parity = 0;
    do {
      for (let k = n - 2; k >= 0; k--) {
        if (perm[k] > perm[k + 1]) {
          continue;
        }
        let l = k + 1;
        for (let L = l; L < n; L++) {
          if (perm[L] > perm[k]) {
            l = L;
          }
        }
        [perm[k], perm[l]] = [perm[l], perm[k]];
        parity ^= 1;
        for (let j = 0; k + 1 + j < n - 1 - j; j++, parity ^= 1) {
          [perm[k + 1 + j], perm[n - 1 - j]] = [
            perm[n - 1 - j],
            perm[k + 1 + j],
          ];
        }
        break;
      }
    } while (parity !== 0);
  }
  return (tables.phase2em = mtable);
}

function generate_phase2_edge_ptable() {
  if (tables.phase2ep) {
    return tables.phase2ep;
  }
  return (tables.phase2ep = bfs(generate_phase2_edge_mtable(), [0]));
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

function ida_solve(indices, mtables, ptables, max_bound) {
  max_bound = max_bound || 999999;
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (bound <= max_bound) {
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
  if (bound === 0) {
    return [];
  }
  if (heuristic === 0 && bound === 1) {
    return;
  }
  for (let m = 0; m < nmoves; m++) {
    if (m === last) {
      continue;
    }
    if (m < last && tetrad[m] === tetrad[last]) {
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

function* ida_solve_gen(indices, mtables, ptables) {
  let ncoords = indices.length;
  let bound = 0;
  for (let i = 0; i < ncoords; i++) {
    bound = Math.max(bound, ptables[i][indices[i]]);
  }
  while (true) {
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
    if (m < last && tetrad[m] === tetrad[last]) {
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

export async function getRandomRediCubeScramble() {
  return new Alg(stringify_move_sequence(generate_random_state_scramble()));
}
