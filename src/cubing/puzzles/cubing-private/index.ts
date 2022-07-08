import { KPuzzle } from "../../kpuzzle";
import { cube3x3x3KPuzzleDefinition as experimentalCube3x3x3KPuzzleDefinition } from "../implementations/dynamic/3x3x3/3x3x3.kpuzzle.json";

export {
  experimentalIs3x3x3Solved,
  normalize3x3x3Orientation as experimentalNormalize3x3x3Orientation,
  puzzleOrientation3x3x3Cache as experimentalPuzzleOrientation3x3x3Cache,
  puzzleOrientation3x3x3Idx as experimentalPuzzleOrientation3x3x3Idx,
} from "../implementations/dynamic/3x3x3/puzzle-orientation";
export { experimentalStickerings } from "../stickerings/puzzle-stickerings";
export { experimentalCube3x3x3KPuzzleDefinition };

/** @deprecated */
export const experimental3x3x3KPuzzle = new KPuzzle(
  experimentalCube3x3x3KPuzzleDefinition,
);
