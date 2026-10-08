import { KPuzzle } from "../../../kpuzzle/index.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { PuzzleLoader } from "../../PuzzleLoader.ts";

export const square1: PuzzleLoader = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hršel", "Vojtech Kopský"],
  inventionYear: 1990, // Czech patent application year: http://spisy.upv.cz/Patents/FullDocuments/277/277266.pdf
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
          .sq1HyperOrbitJSON,
      ),
  ),
  svg: getCached(async () => {
    return (
      await import("../dynamic/side-events/puzzles-dynamic-side-events.ts")
    ).sq1HyperOrbitSVG;
  }),
};
