// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { KPuzzle } from "../../../../cubing/kpuzzle";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { experimentalSolve3x3x3IgnoringCenters } from "../../../../cubing/search";

(async () => {
  const kpuzzle = new KPuzzle(await cube3x3x3.def());
  kpuzzle.applyAlg(await randomScrambleForEvent("333"));
  (await experimentalSolve3x3x3IgnoringCenters(kpuzzle.state)).log();
})();
