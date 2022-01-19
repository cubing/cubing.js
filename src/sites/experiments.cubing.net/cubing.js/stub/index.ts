// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { puzzles } from "../../../../cubing/puzzles";

(async () => {
  const kpuzzle = await puzzles["4x4x4"].kpuzzle();

  const tt = kpuzzle.algToTransformation("R U R'").apply("R U'").apply("R'");

  console.log(tt.isIdentityTransformation());
})();
