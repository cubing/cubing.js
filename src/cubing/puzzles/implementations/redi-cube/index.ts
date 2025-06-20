import { KPuzzle } from "../../../kpuzzle";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";

export const rediCube: PuzzleLoader = {
  id: "redi_cube",
  fullName: "Redi Cube",
  // Announced 2009-07-21: https://www.youtube.com/watch?v=cjfMzA1u3vM
  // https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1520
  inventedBy: ["Oskar van Deventer"],
  inventionYear: 2009,
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
          .rediCubeJSON,
      ),
  ),
  svg: async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
      .rediCubeSVG;
  },
};
