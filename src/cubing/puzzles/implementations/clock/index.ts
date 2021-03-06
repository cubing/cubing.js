import type { PuzzleLoader } from "../../PuzzleLoader";

export const clock: PuzzleLoader = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988, // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  def: async () => {
    return (await import("./clock.kpuzzle.json_")).clockKPuzzle;
  },
  svg: async () => {
    return (await import("./clock.kpuzzle.svg")).default;
  },
};
