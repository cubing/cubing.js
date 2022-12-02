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
import { cube3x3x3 } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { experimentalSolveTwsearch, setDebug } from "cubing/search";

setDebug({ disableStringWorker: true });

(async () => {
  (await randomScrambleForEvent("222")).log();
  (await randomScrambleForEvent("333")).log();

  const kpuzzle = await cube3x3x3.kpuzzle();
  const solvedState = kpuzzle.identityTransformation().toKState().stateData;
  const sune = new KState(kpuzzle, {
    EDGES: {
      pieces: [2, 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [2, 2, 2, 0, 0, 0, 0, 0],
    },
    CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [2, 0, 0, 0, 0, 0],
    },
  });
  (
    await experimentalSolveTwsearch(kpuzzle, sune, {
      moveSubset: ["U", "F", "R"],
    })
  ).log();

  console.log("Success!");
})();
