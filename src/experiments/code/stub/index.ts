// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { KPuzzle } from "../../../cubing/kpuzzle";
import { Alg } from "../../../cubing/alg";
import { puzzles } from "../../../cubing/puzzles";
import { cachedSGSDataPyraminx } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/pyraminx.sgs.json";
import { TrembleSolver } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/tremble";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  const def = await puzzles.pyraminx.def();
  const sgs = await cachedSGSDataPyraminx();
  console.log(sgs);
  const solver = new TrembleSolver(def, sgs, "RLUB".split(""));

  const kpuzzle = new KPuzzle(def);
  kpuzzle.applyAlg(new Alg("L U R' L B' R' L R' L r' b u'"));
  (await solver.solve(kpuzzle.state, 3, () => 3)).log("solver");
})();
