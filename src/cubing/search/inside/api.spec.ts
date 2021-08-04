import { insideAPI, setDebugMeasurePerf } from "./api";

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
  // "clock",
  // "minx",
  "pyram",
  "skewb",
  "sq1",
  "444bf",
  "555bf",
];

setDebugMeasurePerf(false);

describe("Internal API", () => {
  for (const event of events) {
    it(`Generates scramble alg for event: ${event}`, () => {
      expect(() => insideAPI.randomScramble(event)).not.toThrow();
    });
  }

  for (const event of events) {
    it(`Generates scramble string for event: ${event}`, () => {
      expect(() => insideAPI.randomScrambleStringForEvent(event)).not.toThrow();
    });
  }
});
