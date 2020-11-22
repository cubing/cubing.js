import { PuzzleGetter } from "../../Puzzle";

export const cube2x2x2: PuzzleGetter = {
  id: "2x2x2",
  fullName: "2x2x2 Cube",
  kPuzzle: async () => {
    return await import("./2x2x2.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./2x2x2.kpuzzle.svg")).default;
  },
};
