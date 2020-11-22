import { PuzzleGetter } from "../../Puzzle";

export const clock: PuzzleGetter = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988, // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  kPuzzle: async () => {
    return await import("./clock.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./clock.kpuzzle.svg")).default;
  },
};
