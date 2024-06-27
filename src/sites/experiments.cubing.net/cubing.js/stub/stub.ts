// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube2x2x2 } from "cubing/puzzles";
import { experimentalSolveTwsearch } from "cubing/search";

const kpuzzle = await cube2x2x2.kpuzzle();
const pattern = kpuzzle.defaultPattern().applyAlg("L2 F' U' F L2 F2");

console.log(
  (
    await experimentalSolveTwsearch(kpuzzle, pattern, {
      generatorMoves: ["U", "F", "R"],
      quantumMetric: true,
    })
  ).toString(),
);
