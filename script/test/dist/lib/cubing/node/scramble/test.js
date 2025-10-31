import assert from "node:assert";
import { Alg } from "cubing/alg";
import { cube2x2x2 } from "cubing/puzzles";
import {
  experimentalDeriveScrambleForEvent,
  randomScrambleForEvent,
} from "cubing/scramble";
import { experimentalSolveTwsearch, setSearchDebug } from "cubing/search";

setSearchDebug({ disableStringWorker: true });

await (async () => {
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

await (async () => {
  {
    console.log("----------------");
    console.log("Deriving scrambles.");
    setSearchDebug({ allowDerivedScrambles: true });
    const scramble1 = await experimentalDeriveScrambleForEvent(
      "67002dfc95e6d4288f418fbaa9150aa65b239fd5581f2d067d0293b9321a8b67",
      ["222", "222-r4", "set1", "attempt3-extra2", "scramble1"],
      "222",
    );
    console.log(scramble1.toString());
    const scramble2 = await experimentalDeriveScrambleForEvent(
      "67002dfc95e6d4288f418fbaa9150aa65b239fd5581f2d067d0293b9321a8b67",
      ["222", "222-r4", "set1", "attempt3-extra2", "scramble1"],
      "222",
    );
    console.log(scramble2.toString());
    const scramble3 = await experimentalDeriveScrambleForEvent(
      "6700abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
      ["222", "222-r4", "set1", "attempt3-extra2", "scramble1"],
      "222",
    );
    console.log(scramble3.toString());

    assert(scramble1.isIdentical(scramble2));
    assert(!scramble1.isIdentical(scramble3));
  }
})();

// TODO(https://github.com/cubing/cubing.js/issues/358): this shouldn't be needed.
(await import("node:process")).exit(0);
