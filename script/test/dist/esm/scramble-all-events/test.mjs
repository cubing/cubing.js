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

import { setDebug } from "cubing/search";
setDebug({ disableStringWorker: true });

import { randomScrambleForEvent } from "cubing/scramble";

const events = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333fm",
  "333oh",
  "clock",
  "minx",
  "pyram",
  "skewb",
  "sq1",
  "444bf",
  "555bf",
  "333mb",
  "fto",
  "redi_cube",
  "kilominx",
  "master_tetraminx",
];

(async () => {
  for (const event of events) {
    console.log(`Generating scramble for event: ${event}... `);
    (await randomScrambleForEvent(event)).log();
  }

  console.log("Success!");
})();
