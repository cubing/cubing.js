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

import { randomScrambleForEvent } from "cubing/scramble";

(async () => {
  (await randomScrambleForEvent("222")).log();
  (await randomScrambleForEvent("333")).log();

  console.log("Success!");
})();
