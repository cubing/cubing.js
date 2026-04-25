import { expect, test } from "bun:test";
import { SKIP_SLOW_TESTS } from "../../../test/SKIP_SLOW_TESTS";
import { insideAPI, setDebugMeasurePerf } from "./api";

// To keep things fast, we only test a subset of events.
// Other events are handled by `make test-dist-lib-bun-scramble-all-events-all-events`
const events = ["222", "333"];

setDebugMeasurePerf(false);

for (const event of events) {
  test.skipIf(SKIP_SLOW_TESTS)(
    `Internal API generates scramble alg for event: ${event}`,
    () => {
      expect(() => insideAPI.randomScrambleForEvent(event)).not.toThrow();
    },
  );
}

for (const event of events) {
  test.skipIf(SKIP_SLOW_TESTS)(
    `Internal API generates scramble string for event: ${event}`,
    () => {
      expect(() => insideAPI.randomScrambleStringForEvent(event)).not.toThrow();
    },
  );
}
