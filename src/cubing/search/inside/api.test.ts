import { expect, test } from "bun:test";
import { SKIP_SLOW_TESTS } from "../../../test/SKIP_SLOW_TESTS";
import { insideAPI, setDebugMeasurePerf } from "./api";

// To keep things fast, we only test a subset of events.
// Other events are handled by `make test-dist-lib-node-scramble-all-events`
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

// The WCA scramble format for 3x3x3 Fewest Moves requires every scramble to be
// wrapped in `R' U' F`, which means the affixes must not cancel into the core
// scramble. This is easy to get wrong in a way that only shows up for a
// fraction of scrambles, so we check a batch of them.
// See: https://github.com/cubing/cubing.js/issues/429
const FMC_AFFIX = "R' U' F";
const NUM_FMC_SCRAMBLES_TO_TEST = 25;

test.skipIf(SKIP_SLOW_TESTS)(
  `Scrambles for event \`333fm\` are wrapped in \`${FMC_AFFIX}\``,
  async () => {
    for (let i = 0; i < NUM_FMC_SCRAMBLES_TO_TEST; i++) {
      const scramble = await insideAPI.randomScrambleForEvent("333fm");
      const scrambleString = scramble.toString();
      expect(scrambleString).toStartWith(`${FMC_AFFIX} `);
      expect(scrambleString).toEndWith(` ${FMC_AFFIX}`);
      // The affixes are only the boundary case: no pair of moves anywhere in
      // the scramble should cancel. Any cancellation shows up as a shorter alg
      // after simplification.
      expect(
        scramble
          .experimentalSimplify({
            cancel: true,
            puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
          })
          .experimentalNumChildAlgNodes(),
      ).toBe(scramble.experimentalNumChildAlgNodes());
    }
  },
  60_000,
);
