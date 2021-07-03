// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../cubing/alg";
import { KPuzzle } from "../../../cubing/kpuzzle";
import { puzzles } from "../../../cubing/puzzles";
import { cachedSGSDataMegaminx } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/megaminx.sgs.json";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  // console.log(await randomScrambleForEvent("minx"));

  const def = await puzzles.megaminx.def();
  const kpuzzle = new KPuzzle(def);
  kpuzzle.applyAlg(new Alg("R U R' F"));
  const sgs = await cachedSGSDataMegaminx();
  console.log(sgs);
})();
