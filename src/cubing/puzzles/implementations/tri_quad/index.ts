import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { getCached } from "../../async/lazy-cached";

export const tri_quad: PuzzleLoader = {
  id: "tri_quad",
  fullName: "TriQuad",
  inventedBy: ["Bram Cohen", "Carl Hoff"],
  inventionYear: 2018, // https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=6809
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
          .triQuadJSON,
      ),
  ),
  svg: getCached(async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .triQuadSVG;
  }),
};
