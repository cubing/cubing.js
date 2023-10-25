import { cube2x2x2 } from "../../../../cubing/puzzles";
import { experimentalSolveTwsearch } from "../../../../cubing/search";
import { randomScrambleForEvent } from "../../../../cubing/search/outside";

(async () => {
  const scramble222 = await randomScrambleForEvent("222");
  scramble222.log();
  (await randomScrambleForEvent("333")).log();

  const kpuzzle2x2x2 = await cube2x2x2.kpuzzle();
  const scramble222Transformation =
    kpuzzle2x2x2.algToTransformation(scramble222);
  const scramble222Solution = await experimentalSolveTwsearch(
    kpuzzle2x2x2,
    scramble222Transformation.toKPattern(),
    { generatorMoves: "ULFR".split(""), minDepth: 11 },
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
