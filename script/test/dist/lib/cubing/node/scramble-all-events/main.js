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
  "444",
  "444bf",
  "kilominx",
  "fto",
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

const eventsParallel = [];
const DEFAULT_TIMEOUT_MS = 30_000; // TODO: Use `Temporal.Duration.from(…)` once `Temporal` is available in `bun`: https://github.com/oven-sh/bun/issues/15853

function withTimeout(promiseFn, { abortSignal, timeoutMS } = {}) {
  const { promise: wrappedPromise, resolve, reject } = Promise.withResolvers();

  const timeout = setTimeout(() => {
    abortSignal?.();
    reject(new Error(`Timed out for event: ${event}`));
  }, timeoutMS ?? DEFAULT_TIMEOUT_MS);

  void (async () => {
    await promiseFn();
    // Types are a bit borked, so `timeout.unref()` isn't recognized as valid.
    // Fortunately the DOM API is still valid in `node`, so we call that instead.
    clearTimeout(timeout);
    resolve();
  })();

  return wrappedPromise;
}

async function testEvent(event) {
  await withTimeout(async () =>
    (await randomScrambleForEvent(event)).log(event),
  );
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
