import { Alg } from "cubing/alg";
import { cube2x2x2 } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { experimentalSolveTwsearch, setSearchDebug } from "cubing/search";

setSearchDebug({ disableStringWorker: true });

(async () => {
  (await randomScrambleForEvent("222")).log();
  (await randomScrambleForEvent("333")).log();

  const scramble222 = new Alg("R' F2 R F2 R F' U2 R' F' L2 F'");
  const kpuzzle = await cube2x2x2.kpuzzle();
  const scramble222Transformation = kpuzzle.algToTransformation(scramble222);
  const scramble222Solution = await experimentalSolveTwsearch(
    kpuzzle,
    scramble222Transformation.toKPattern(),
    { generatorMoves: "ULFR".split(""), minDepth: 11 },
  );
  scramble222.concat(".").concat(scramble222Solution).log();
  if (
    !scramble222Transformation
      .applyAlg(scramble222Solution)
      .isIdentical(kpuzzle.identityTransformation())
  ) {
    throw new Error("Invalid solution!");
  }
  const numMoves = scramble222Solution.experimentalNumChildAlgNodes();
  if (numMoves < 11) {
    throw new Error(`Solution too short (at least 11 expected): ${numMoves}`);
  }

  console.log("Success!");
})();
