import { PuzzleManager } from "../../PuzzleManager";

export const cube2x2x2: PuzzleManager = {
  id: "2x2x2",
  fullName: "2x2x2 Cube",
  def: async () => {
    return await import("./2x2x2.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./2x2x2.kpuzzle.svg")).default;
  },
};
