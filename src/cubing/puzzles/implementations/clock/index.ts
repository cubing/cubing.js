import { KPuzzle } from "../../../kpuzzle/index.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { PuzzleLoader } from "../../PuzzleLoader.ts";

export const clock: PuzzleLoader = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988, // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
          .clockJSON,
      ),
  ),
  svg: getCached(async () => {
    return (
      await import("../dynamic/side-events/puzzles-dynamic-side-events.ts")
    ).clockSVG;
  }),
};
