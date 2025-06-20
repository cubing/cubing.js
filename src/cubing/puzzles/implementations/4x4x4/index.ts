import { CubePGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { cube4x4x4KeyMapping } from "./cube4x4x4KeyMapping";

const cube4x4x4: PuzzleLoader = new CubePGPuzzleLoader({
  id: "4x4x4",
  fullName: "4×4×4 Cube",
});

cube4x4x4.llSVG = getCached(async () => {
  return (await import("../dynamic/4x4x4/puzzles-dynamic-4x4x4"))
    .cube4x4x4LLSVG;
});
cube4x4x4.keyMapping = async () => cube4x4x4KeyMapping; // TODO: async loading

export { cube4x4x4 };
