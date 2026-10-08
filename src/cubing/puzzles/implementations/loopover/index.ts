import { KPuzzle } from "../../../kpuzzle/index.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { PuzzleLoader } from "../../PuzzleLoader.ts";

export const loopover: PuzzleLoader = {
  id: "loopover",
  fullName: "Loopover",
  inventedBy: ["Cary Huang"],
  inventionYear: 2018,
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/unofficial/puzzles-dynamic-unofficial.ts"))
          .loopoverJSON,
      ),
  ),
  svg: async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial.ts"))
      .loopoverSVG;
  },
};
