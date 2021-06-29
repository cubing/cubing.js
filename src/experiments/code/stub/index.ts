// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube2x2x2 } from "../../../cubing/puzzles";
// import { random222Scramble } from "../../../cubing/solve/vendor/implementations/2x2x2";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

// (async () => {
//   (await random222Scramble()).log("222");
// })();

import { parseSGS } from "./sgs2";

(async () => {
  const sgs = parseSGS(
    await cube2x2x2.def(),
    `SetOrder CORNERS 5 6 7 4 3 2 1 0
Alg F
Alg F2
Alg F'
Alg D
Alg D2
Alg D'
Alg L
Alg L2
Alg L'
Alg F U
Alg F U2
Alg F U'
Alg F L
Alg F L2
Alg F L'
Alg F2 U
Alg F2 U'
Alg F2 R
Alg F2 R'
Alg F' D
Alg F' D'
Alg F' R
Alg F' R'
Alg B
Alg B2
Alg B'
Alg B R
Alg B R2
Alg B R'
Alg B2 U
Alg B2 U2
Alg B2 U'
Alg B2 R
Alg B2 R2
Alg B2 R'
Alg B' U
Alg B' U'
Alg F D' F'
Alg F2 L F2
Alg B R' B2
Alg B R' U2
Alg B2 U R'
Alg B2 R B'
Alg R
Alg R2
Alg R'
Alg R2 U
Alg R2 U2
Alg R2 U'
Alg R' U
Alg R' U2
Alg R' U'
Alg F R F'
Alg F R2 F'
Alg L2 D' L2
Alg L' B L
Alg R2 U' R
Alg R' U R2
Alg R' U R'
Alg F R F' U2
Alg F' U F
Alg F' U2 F
Alg F' U' F
Alg L F L'
Alg L F2 L'
Alg L F' L'
Alg F' D R D'
Alg F' U2 F U'
Alg F D2 B D2 F'
Alg F2 D' L2 D F2
Alg F2 L F L' F
Alg L' F2 L' F2 L
Alg F L' U' L2 F L'
Alg F2 L F L' U2 F
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
Alg F D B D' R' F' U
Alg F' D L F U B' L'
Alg F' L' F U L U L'
Alg D' L F D R' U' F'
Alg L F L' U' F' U' F
Alg L D' F' L' U' R F
Alg F D F U F' L' F' R'
Alg F2 D' F L F2 D F' R'
Alg F D' F L' D F R2 U2 F' U'
Alg F D' L D' L F D2 L2 B' R'
Alg F L' D F R2 D2 L D F' U2
Alg F L' D F2 D' L F L2 F2 U
Alg F D F' D L2 F R' F' D' B2 U'`,
  );
  console.log(sgs);
  const str = JSON.stringify(sgs);
  // console.log(sgs);
  globalThis?.document?.body
    .appendChild(document.createElement("button"))
    .addEventListener("click", () => {
      console.log("click");
      navigator.clipboard.writeText(str);
    });
})();
