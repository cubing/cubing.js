import { expect, test } from "bun:test";

import { insideAPI, setDebugMeasurePerf } from "./api";

// To keep things fast, we only test a subset of events.
// Other events are handled by `make test-dist-lib-bun-scramble-all-events-all-events`
const events = ["222", "333"] as const;

setDebugMeasurePerf(false);

for (const event of events) {
  test(`Internal API generates scramble alg for event: ${event}`, () => {
    expect(() => insideAPI.randomScrambleForEvent(event)).not.toThrow();
  });
}

for (const event of events) {
  test(`Internal API generates scramble string for event: ${event}`, () => {
    expect(() => insideAPI.randomScrambleStringForEvent(event)).not.toThrow();
  });
}
