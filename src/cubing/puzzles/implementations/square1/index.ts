import { KPuzzle } from "../../../kpuzzle";
import { lazyKPuzzle } from "../../async/lazy-cached-kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";

export const square1: PuzzleLoader = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hršel", "Vojtech Kopský"],
  inventionYear: 1990, // Czech patent application year: http://spisy.upv.cz/Patents/FullDocuments/277/277266.pdf
  kpuzzle: lazyKPuzzle(
    async () =>
      new KPuzzle(
        (
          await import("./sq1-hyperorbit.kpuzzle.json")
        ).sq1HyperOrbitKPuzzleDefinition,
      ),
  ),
  svg: async () => {
    return (await import("./sq1-hyperorbit.kpuzzle.svg")).default;
  },
};
