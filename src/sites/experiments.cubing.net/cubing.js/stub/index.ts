// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { KPuzzle } from "../../../../cubing/kpuzzle/KPuzzle";
import { puzzles } from "../../../../cubing/puzzles";

(async () => {
  const def = await puzzles["4x4x4"].def();
  const kpuzzle = new KPuzzle(def);

  const t1 = kpuzzle.moveToTransformation("R");
  console.log(t1.isIdentity());
  const t2 = t1.applyTransformation(kpuzzle.moveToTransformation("R'"));
  console.log(t2.isIdentity());

  const tt = kpuzzle.algToTransformation("((R U)100)10000");
  console.log(tt.isIdentity());
})();
