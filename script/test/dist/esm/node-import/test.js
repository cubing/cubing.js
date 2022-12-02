import "cubing/alg";
import "cubing/bluetooth";
import "cubing/kpuzzle";
import "cubing/notation";
import "cubing/protocol";
import "cubing/puzzle-geometry";
import "cubing/puzzles";
import "cubing/scramble";
import "cubing/search";
import "cubing/stream";
import "cubing/twisty";

import { KState } from "cubing/kpuzzle";
import { cube2x2x2 } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { experimentalSolveTwsearch, setDebug } from "cubing/search";

setDebug({ disableStringWorker: true });

(async () => {
  const scramble222 = await randomScrambleForEvent("222");
  scramble222.log();
  (await randomScrambleForEvent("333")).log();

  const kpuzzle = await cube2x2x2.kpuzzle();
  const scramble222Transformation = kpuzzle.algToTransformation(scramble222);
  const scramble222Solution = await experimentalSolveTwsearch(
    kpuzzle,
    scramble222Transformation.toKState(),
    { moveSubset: "ULFR".split("") },
  );
  scramble222.concat(".").concat(scramble222Solution).log();
  if (
    !scramble222Transformation
      .applyAlg(scramble222Solution)
      .isIdentical(kpuzzle.identityTransformation())
  ) {
    throw new Error("Invalid solution!");
  }

  console.log("Success!");
})();
