import { Path } from "path-class";
import { needPath } from "../../../../../../lib/needPath.js";

await needPath(
  Path.resolve(
    "../../../../../../../dist/lib/cubing/scramble",
    import.meta.url,
  ),
  "make build-lib-js",
);

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

setSearchDebug({ scramblePrefetchLevel: "none" });

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
  "kilominx",
  "444",
  "444bf",
  "fto",
];

const eventsParallel = [];

async function testEvent(event) {
  const { promise, resolve, reject } = Promise.withResolvers();

  void (async () => {
    (await randomScrambleForEvent(event)).log(event);
    resolve();
  })();

  setTimeout(() => reject(`Timed out for event: ${event}`), 30_000); // 30 seconds

  return promise;
}

await (async () => {
  setSearchDebug({ forceNewWorkerForEveryScramble: true });
  const parallelPromise = Promise.all(eventsParallel.map(testEvent));
  setSearchDebug({ forceNewWorkerForEveryScramble: false });
  for (const event of eventsOrdered) {
    console.log(`Generating scramble for event: ${event}... `);
    await testEvent(event);
  }
  await parallelPromise;

  console.log("Success!");
})();
