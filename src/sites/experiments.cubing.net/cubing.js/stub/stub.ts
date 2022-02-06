// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube3x3x3 } from "../../../../cubing/puzzles";

(async () => {
  const kpuzzle = cube3x3x3.kpuzzle();
  console.log((await kpuzzle).algToTransformation("x y").transformationData);
})();
