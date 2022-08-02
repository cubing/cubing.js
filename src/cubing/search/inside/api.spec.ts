import { insideAPI, setDebugMeasurePerf } from "./api";

// To keep things fast, we only test a subset of events.
// Other events are handled by `make test-dist-esm-scramble-all-events`
const events = ["222", "333"];

setDebugMeasurePerf(false);

describe("Internal API", () => {
  for (const event of events) {
    it(`Generates scramble alg for event: ${event}`, () => {
      expect(() => insideAPI.randomScrambleForEvent(event)).not.toThrow();
    });
  }

  for (const event of events) {
    it(`Generates scramble string for event: ${event}`, () => {
      expect(() => insideAPI.randomScrambleStringForEvent(event)).not.toThrow();
    });
  }
});
