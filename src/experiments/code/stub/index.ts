// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube2x2x2 } from "../../../cubing/puzzles";
import { random222Scramble } from "../../../cubing/solve/vendor/implementations/2x2x2";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  (await random222Scramble()).log("222");
})();

import { parseSGS } from "./sgs";

(async () => {
  parseSGS(
    await cube2x2x2.def(),
    `SetOrder CORNERS 8 7 6 5 4 1 2 3
Alg F
Alg F2
Alg F'
Alg D
Alg D2
Alg D'
Alg L
Alg L2
Alg L'
Alg F D
Alg F D2
Alg F D'
Alg F R
Alg F R2
Alg F R'
Alg F2 U
Alg F2 U'
Alg F2 R
Alg F2 R'
Alg F' U
Alg F' U'
Alg F' L
Alg F' L'
Alg B
Alg B2
Alg B'
Alg B U
Alg B U2
Alg B U'
Alg B2 U
Alg B2 U2
Alg B2 U'
Alg B2 R
Alg B2 R2
Alg B2 R'
Alg B' R
Alg B' R'
Alg F L' F'
Alg F2 D F2
Alg B U' B2
Alg B U' R2
Alg B2 U B'
Alg B2 R U'
Alg R
Alg R2
Alg R'
Alg R U
Alg R U2
Alg R U'
Alg R2 U
Alg R2 U2
Alg R2 U'
Alg F' R2 F
Alg F' R' F
Alg L B' L'
Alg L2 D L2
Alg R U' R
Alg R U' R2
Alg R2 U R'
Alg B' U2 B U'
Alg F U F'
Alg F U2 F'
Alg F U' F'
Alg L' F L
Alg L' F2 L
Alg L' F' L
Alg F D' R' D
Alg B R B' U2
Alg F R F2 R' F'
Alg F2 L' F' L F'
Alg F' D2 B' D2 F
Alg L F2 L F2 L'
Alg F D2 B' L' D2 R
Alg F D' R2 F D L'
Alg U
Alg U2
Alg U'
Alg F2 D2 B D2 F2
Alg F2 D2 B' D2 F2
Alg L2 D2 R D2 L2
Alg L2 D2 R' D2 L2
Alg F2 D2 B D2 F2 U
Alg F2 D2 B D2 F2 U'
Alg U F2 D2 B D2 F2
Alg U F2 D2 B' D2 F2
Alg F D' L' F' U' B L
Alg F L F' U' L' U' L
Alg F L D F' L' B' U'
Alg D L U B D' L' F'
Alg L' F' L U F U F'
Alg L' D F L U R' F'
Alg F D F D' R' U2 F' R2
Alg F D F U F' D' F' R'
Alg F D' L F U2 L2 D L F' R2
Alg F D' L F2 L' D F D2 F2 R
Alg F L' F D' L F U2 R2 F' R'
Alg F L' D L' D F L2 D2 B' U'
Alg F L F' D2 B' L' U' L D2 F L'`,
  );
})();
