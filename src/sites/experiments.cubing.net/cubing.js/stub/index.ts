// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { KPuzzle } from "../../../../cubing/kpuzzle/KPuzzle";
import { puzzles } from "../../../../cubing/puzzles";

(async () => {
  const def = await puzzles["4x4x4"].def();
  const kpuzzle = new KPuzzle(def);

  const tt = kpuzzle.algToTransformation("R U R'").applyAlg("R U' R'");

  console.log(tt.isIdentityTransformation());
})();
