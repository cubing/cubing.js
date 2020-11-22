import { PuzzleManager } from "../../PuzzleManager";

export const square1: PuzzleManager = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hrsel", "Vojtech Kopsky"],
  inventionYear: 1990, // Czech patent application year: http://spisy.upv.cz/Patents/FullDocuments/277/277266.pdf
  kPuzzle: async () => {
    return await import("./sq1-hyperorbit.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./sq1-hyperorbit.kpuzzle.svg")).default;
  },
};
