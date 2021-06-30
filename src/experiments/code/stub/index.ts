// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../cubing/alg";
import { KPuzzle, parseKPuzzleDefinition } from "../../../cubing/kpuzzle";
import { cachedSGSDataSkewb } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/skewb.sgs.json";
import { TrembleSolver } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/tremble";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  console.log(await cachedSGSDataSkewb());

  const json = await cachedSGSDataSkewb();

  const def = parseKPuzzleDefinition(`Name PuzzleGeometryPuzzle
Set CORNERS 8 3
Set CENTERS 6 1

Solved
CORNERS
1 2 3 4 5 6 7 8
0 0 0 0 0 0 0 0
CENTERS
1 2 3 4 5 6
0 0 0 0 0 0
End

Move U
CORNERS
8 1 3 4 5 6 7 2
1 1 0 0 0 0 2 1
CENTERS
1 2 3 5 6 4
End

Move L
CORNERS
3 2 8 4 5 6 7 1
1 0 1 0 2 0 0 1
CENTERS
3 2 5 4 1 6
End

Move R
CORNERS
1 8 2 4 5 6 7 3
0 1 1 0 0 2 0 1
CENTERS
1 6 2 4 5 3
End

Move B
CORNERS
1 2 3 4 6 7 5 8
0 0 0 0 1 1 1 2
CENTERS
1 2 6 4 3 5
End`);

  // const def = await puzzles.skewb.def();
  const solver = new TrembleSolver(def, json, "RLUB".split(""));
  const kpuzzle = new KPuzzle(def);
  // kpuzzle.applyAlg(new Alg("U' B U' B U L B R' L B'"));
  kpuzzle.applyAlg(new Alg("([U, B'])3"));
  // kpuzzle.applyAlg(new Alg("R U"));
  console.log("state", kpuzzle.state);
  (await solver.solve(kpuzzle.state, 0)).log();
})();
