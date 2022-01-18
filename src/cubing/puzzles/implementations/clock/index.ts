import { lazyKPuzzle } from "../../async/lazy-cached-kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";

export const clock: PuzzleLoader = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988, // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  kpuzzle: lazyKPuzzle(
    async () => (await import("./clock.kpuzzle.json")).clockKPuzzle,
  ),
  svg: async () => {
    return (await import("./clock.kpuzzle.svg")).default;
  },
};
