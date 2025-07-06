import { KPuzzle } from "../../kpuzzle";
import { getCached } from "../async/lazy-cached";
import { cube3x3x3KPuzzleDefinition as experimentalCube3x3x3KPuzzleDefinition } from "../implementations/dynamic/3x3x3/3x3x3.kpuzzle.json";
import { experimentalIs3x3x3Solved } from "../implementations/dynamic/3x3x3/puzzle-orientation";

export { getPartialAppendOptionsForPuzzleSpecificSimplifyOptions } from "../PuzzleLoader";
export { experimentalCube3x3x3KPuzzleDefinition };

/** @deprecated */
export const experimental3x3x3KPuzzle = new KPuzzle(
  experimentalCube3x3x3KPuzzleDefinition,
);
experimentalCube3x3x3KPuzzleDefinition.experimentalIsPatternSolved =
  experimentalIs3x3x3Solved;

export { customPGPuzzleLoader as experimentalCustomPGPuzzleLoader } from "../customPGPuzzleLoader";
export {
  experimentalIs2x2x2Solved,
  normalize2x2x2Orientation as experimentalNormalize2x2x2Orientation,
  puzzleOrientation2x2x2Cache as experimentalPuzzleOrientation2x2x2Cache,
  puzzleOrientation2x2x2Idx as experimentalPuzzleOrientation2x2x2Idx,
} from "../implementations/dynamic/2x2x2/puzzle-orientation"; // TODO: Actually dynamic
export {
  experimentalIs3x3x3Solved,
  normalize3x3x3Orientation as experimentalNormalize3x3x3Orientation,
  puzzleOrientation3x3x3Cache as experimentalPuzzleOrientation3x3x3Cache,
  puzzleOrientation3x3x3Idx as experimentalPuzzleOrientation3x3x3Idx,
} from "../implementations/dynamic/3x3x3/puzzle-orientation"; // TODO: Actually dynamic
export type { KeyMapping } from "../PuzzleLoader";
export type {
  FaceletMeshStickeringMask as ExperimentalFaceletMeshStickeringMask,
  PieceStickeringMask as ExperimentalPieceStickeringMask,
  StickeringMask as ExperimentalStickeringMask,
} from "../stickerings/mask";
export {
  getFaceletStickeringMask as experimentalGetFaceletStickeringMask,
  getPieceStickeringMask as experimentalGetPieceStickeringMask,
  PieceStickering as ExperimentalPieceStickering,
} from "../stickerings/mask";
export { experimentalStickerings } from "../stickerings/puzzle-stickerings";
export const bigCubePuzzleOrientation = getCached(
  () => import("../implementations/dynamic/big-cubes/big-puzzle-orientation"),
);
