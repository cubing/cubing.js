import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { getCached } from "../../async/lazy-cached";

export const loopover: PuzzleLoader = {
  id: "loopover",
  fullName: "Loopover",
  inventedBy: ["Cary Huang"],
  inventionYear: 2018,
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
          .loopoverJSON,
      ),
  ),
  svg: async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
      .loopoverSVG;
  },
};
