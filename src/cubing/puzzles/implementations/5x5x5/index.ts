import { CubePGPuzzleLoader, PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { bigCubePuzzleOrientation } from "../../cubing-private";
import type { PuzzleLoader } from "../../PuzzleLoader";
import { cube4x4x4And5x5x5KeyMapping } from "../4x4x4/cube4x4x4And5x5x5KeyMapping";

const cube5x5x5: PuzzleLoader = new CubePGPuzzleLoader({
  id: "5x5x5",
  fullName: "5×5×5 Cube",
  inventedBy: ["Udo Krell"],
  inventionYear: 1981,
});

cube5x5x5.keyMapping = async () => cube4x4x4And5x5x5KeyMapping; // TODO: async loading

cube5x5x5.kpuzzle = getCached(async () => {
  const kpuzzle = await PGPuzzleLoader.prototype.kpuzzle.call(cube5x5x5);

  const speffzDistinguishableCenters = [
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
  // TODO: pass up an option to do this instead.
  kpuzzle.definition.defaultPattern["CENTERS"].pieces =
    speffzDistinguishableCenters;
  kpuzzle.definition.defaultPattern["CENTERS2"].pieces =
    speffzDistinguishableCenters;
  kpuzzle.definition.defaultPattern["CENTERS3"].orientationMod = new Array(
    6,
  ).fill(1);
  const { experimentalIsBigCubeSolved } = await bigCubePuzzleOrientation();
  kpuzzle.definition.experimentalIsPatternSolved = experimentalIsBigCubeSolved;
  return kpuzzle;
});

export { cube5x5x5 };
