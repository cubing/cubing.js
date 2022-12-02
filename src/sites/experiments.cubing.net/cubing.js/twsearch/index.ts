import { KState } from "../../../../cubing/kpuzzle";
import { cube2x2x2, cube3x3x3 } from "../../../../cubing/puzzles";
import { experimentalSolveTwsearch } from "../../../../cubing/search";
import { randomScrambleForEvent } from "../../../../cubing/search/outside";

(async () => {
  const kpuzzle3x3x3 = await cube3x3x3.kpuzzle();
  const twoGen = kpuzzle3x3x3
    .algToTransformation(
      "R U R U' R U' R U' R U' R' U' R U R U R U R' U' R' U R' U' R' U' R U R' U R U R' U' R U' R' U R' U' R U' R U' R U' R U R U R' U R' U' R U' R U' R U",
    )
    .toKState();
  (
    await experimentalSolveTwsearch(kpuzzle3x3x3, twoGen, {
      moveSubset: ["U", "R"],
    })
  ).log();

  const solvedState = kpuzzle3x3x3
    .identityTransformation()
    .toKState().stateData;
  const twoFlip = new KState(kpuzzle3x3x3, {
    ...solvedState,
    EDGES: {
      ...solvedState["EDGES"],
      orientation: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  });
  (
    await experimentalSolveTwsearch(kpuzzle3x3x3, twoFlip, {
      moveSubset: ["U", "F", "R"],
    })
  ).log();

  const scramble222 = await randomScrambleForEvent("222");
  scramble222.log();
  (await randomScrambleForEvent("333")).log();

  const kpuzzle2x2x2 = await cube2x2x2.kpuzzle();
  const scramble222Transformation =
    kpuzzle2x2x2.algToTransformation(scramble222);
  const scramble222Solution = await experimentalSolveTwsearch(
    kpuzzle2x2x2,
    scramble222Transformation.toKState(),
    { moveSubset: "ULFR".split("") },
  );
  scramble222.concat(".").concat(scramble222Solution).log();
  if (
    !scramble222Transformation
      .applyAlg(scramble222Solution)
      .isIdentical(kpuzzle2x2x2.identityTransformation())
  ) {
    throw new Error("Invalid solution!");
  }
})();
