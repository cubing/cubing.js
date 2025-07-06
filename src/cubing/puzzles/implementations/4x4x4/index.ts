import { CubePGPuzzleLoader, PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { bigCubePuzzleOrientation } from "../../cubing-private";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { cube4x4x4And5x5x5KeyMapping } from "./cube4x4x4And5x5x5KeyMapping";

const cube4x4x4: PuzzleLoader = new CubePGPuzzleLoader({
  id: "4x4x4",
  fullName: "4×4×4 Cube",
  inventedBy: ["Peter Sebestény"],
  inventionYear: 1981,
});

cube4x4x4.llSVG = getCached(async () => {
  return (await import("../dynamic/4x4x4/puzzles-dynamic-4x4x4"))
    .cube4x4x4LLSVG;
});
cube4x4x4.keyMapping = async () => cube4x4x4And5x5x5KeyMapping; // TODO: async loading

cube4x4x4.kpuzzle = getCached(async () => {
  const kpuzzle = await PGPuzzleLoader.prototype.kpuzzle.call(cube4x4x4);
  // TODO: pass up an option to do this instead.
  kpuzzle.definition.defaultPattern["CENTERS"].pieces = [
    // U
    0, 0, 0, 0,
    // L
    4, 4, 4, 4,
    // F
    8, 8, 8, 8,
    // R
    12, 12, 12, 12,
    // B
    16, 16, 16, 16,
    // D
    20, 20, 20, 20,
  ];
  const { experimentalIsBigCubeSolved } = await bigCubePuzzleOrientation();
  kpuzzle.definition.experimentalIsPatternSolved = experimentalIsBigCubeSolved;
  return kpuzzle;
});

export { cube4x4x4 };
