import { cube3x3x3 } from "../../../../cubing/puzzles";
import { solveTwsearch } from "../../../../cubing/search/outside";

(async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const state = kpuzzle
    .algToTransformation(
      "R U R U' R U' R U' R U' R' U' R U R U R U R' U' R' U R' U' R' U' R U R' U R U R' U' R U' R' U R' U' R U' R U' R U' R U R U R' U R' U' R U' R U' R U",
    )
    .toKState();
  (await solveTwsearch(kpuzzle, state, { moveSubset: ["U", "R"] })).log();
})();
