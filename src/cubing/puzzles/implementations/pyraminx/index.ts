import { PuzzleGetter } from "../../Puzzle";

export const pyraminx: PuzzleGetter = {
  id: "pyraminx",
  fullName: "Pyraminx",
  inventedBy: ["Uwe Meffert"],
  inventionYear: 1970, // https://en.wikipedia.org/wiki/Pyraminx#Description
  kPuzzle: async () => {
    return await import("./pyraminx.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./pyraminx.kpuzzle.svg")).default;
  },
};
