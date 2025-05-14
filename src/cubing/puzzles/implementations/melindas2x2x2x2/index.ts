import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { getCached } from "../../async/lazy-cached";

export const melindas2x2x2x2: PuzzleLoader = {
  id: "melindas2x2x2x2",
  fullName: "Melinda's 2×2×2×2",
  inventedBy: ["Melinda Green"],
  // inventionYear: 20__, // TODO
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
          .melindas2x2x2x2OrbitJSON,
      ),
  ),
  svg: getCached(async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .melindas2x2x2x2OrbitSVG;
  }),
};
