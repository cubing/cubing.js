import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

// Include 3x3x3 in the main bundle for better performance.
import kpuzzle3x3x3 from "./3x3x3.kpuzzle.json";

export const cube3x3x3: PuzzleManager = {
  id: "3x3x3",
  fullName: "3x3x3 Cube",
  inventedBy: ["Ernő Rubik"],
  inventionYear: 1974, // https://en.wikipedia.org/wiki/Rubik%27s_Cube#Conception_and_development
  def: async () => {
    // return await import("./3x3x3.kpuzzle.json");
    return kpuzzle3x3x3;
  },
  svg: async () => {
    return (await import("./3x3x3.kpuzzle.svg")).default;
  },
  llSVG: async () => {
    return (await import("./3x3x3-ll.kpuzzle.svg")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("3x3x3"); // TODO: def compat
  },
};
