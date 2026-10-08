import { KPuzzle } from "../../../kpuzzle/index.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { PuzzleLoader } from "../../PuzzleLoader.ts";

export const tri_quad: PuzzleLoader = {
  id: "tri_quad",
  fullName: "TriQuad",
  inventedBy: ["Bram Cohen", "Carl Hoff"],
  inventionYear: 2018, // https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=6809
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
          .triQuadJSON,
      ),
  ),
  svg: getCached(async () => {
    return (
      await import("../dynamic/side-events/puzzles-dynamic-side-events.ts")
    ).triQuadSVG;
  }),
};
