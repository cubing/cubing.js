import { PuzzleGetter } from "../../Puzzle";

export const cube3x3x3: PuzzleGetter = {
  id: "3x3x3",
  fullName: "3x3x3 Cube",
  inventedBy: ["Ernő Rubik"],
  inventionYear: 1974, // https://en.wikipedia.org/wiki/Rubik%27s_Cube#Conception_and_development
  kPuzzle: async () => {
    return await import("./3x3x3.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./3x3x3.kpuzzle.svg")).default;
  },
};
