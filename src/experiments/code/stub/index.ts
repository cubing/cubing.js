// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../cubing/alg";
import { KPuzzle } from "../../../cubing/kpuzzle";
import { puzzles } from "../../../cubing/puzzles";
import { cachedSGSDataSkewb } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/skewb.sgs.json";
import { TrembleSolver } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/tremble";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  console.log(await cachedSGSDataSkewb());

  const json = await cachedSGSDataSkewb();

  const def = await puzzles.skewb.def();
  const solver = new TrembleSolver(def, json, "RLUB".split(""));
  const kpuzzle = new KPuzzle(def);
  kpuzzle.applyAlg(new Alg("U' B U' B U L B R' L B'"));
  solver.solve(kpuzzle.state);
})();
