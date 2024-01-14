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

import { setSearchDebug } from "cubing/search";
setSearchDebug({ disableStringWorker: true, scramblePrefetchLevel: "none" });

import { randomScrambleForEvent } from "cubing/scramble";

const eventsOrdered = [
  "333",
  "222",
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
  "555bf",
  "333mbf",
  "redi_cube",
  "master_tetraminx",
];

const eventsParallel = ["kilominx", "444", "444bf", "fto"];

await (async () => {
  setSearchDebug({ forceNewWorkerForEveryScramble: true });
  const parallelPromise = Promise.all(
    eventsParallel.map(async (event) =>
      (await randomScrambleForEvent(event)).log(event),
    ),
  );
  setSearchDebug({ forceNewWorkerForEveryScramble: false });
  for (const event of eventsOrdered) {
    console.log(`Generating scramble for event: ${event}... `);
    (await randomScrambleForEvent(event)).log(event);
  }
  await parallelPromise;

  console.log("Success!");
})();
