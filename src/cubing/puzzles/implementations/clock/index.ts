import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { getCached } from "../../async/lazy-cached";

export const clock: PuzzleLoader = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988, // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
          .clockJSON,
      ),
  ),
  svg: getCached(async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .clockSVG;
  }),
};
