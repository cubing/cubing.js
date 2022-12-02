import { KState } from "../../../../cubing/kpuzzle";
import { cube3x3x3 } from "../../../../cubing/puzzles";
import { solveTwsearch } from "../../../../cubing/search/outside";

(async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  const twoGen = kpuzzle
    .algToTransformation(
      "R U R U' R U' R U' R U' R' U' R U R U R U R' U' R' U R' U' R' U' R U R' U R U R' U' R U' R' U R' U' R U' R U' R U' R U R U R' U R' U' R U' R U' R U",
    )
    .toKState();
  (await solveTwsearch(kpuzzle, twoGen, { moveSubset: ["U", "R"] })).log();

  const solvedState = kpuzzle.identityTransformation().toKState().stateData;
  const twoFlip = new KState(kpuzzle, {
    ...solvedState,
    EDGES: {
      ...solvedState["EDGES"],
      orientation: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  });
  (
    await solveTwsearch(kpuzzle, twoFlip, { moveSubset: ["U", "F", "R"] })
  ).log();
})();
