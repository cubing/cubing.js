import type { PuzzleLoader } from "../../PuzzleLoader";

export const square1: PuzzleLoader = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hršel", "Vojtech Kopský"],
  inventionYear: 1990, // Czech patent application year: http://spisy.upv.cz/Patents/FullDocuments/277/277266.pdf
  def: async () => {
    return (await import("./sq1-hyperorbit.kpuzzle.json")).sq1HyperOrbitKPuzzle;
  },
  svg: async () => {
    return (await import("./sq1-hyperorbit.kpuzzle.svg")).default;
  },
};
