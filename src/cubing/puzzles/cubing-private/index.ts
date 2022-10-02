import { KPuzzle } from "../../kpuzzle";
import {
  cube3x3x3KPuzzleDefinition as experimentalCube3x3x3KPuzzleDefinition,
} from "../implementations/dynamic/3x3x3/3x3x3.kpuzzle.json";
import { experimentalIs3x3x3Solved } from "../implementations/dynamic/3x3x3/puzzle-orientation";
export { experimentalCube3x3x3KPuzzleDefinition };

/** @deprecated */
export const experimental3x3x3KPuzzle = new KPuzzle(
  experimentalCube3x3x3KPuzzleDefinition,
);
experimentalCube3x3x3KPuzzleDefinition.experimentalIsStateSolved =
  experimentalIs3x3x3Solved;

export {
  experimentalIs3x3x3Solved,
  normalize3x3x3Orientation as experimentalNormalize3x3x3Orientation,
  puzzleOrientation3x3x3Cache as experimentalPuzzleOrientation3x3x3Cache,
  puzzleOrientation3x3x3Idx as experimentalPuzzleOrientation3x3x3Idx,
} from "../implementations/dynamic/3x3x3/puzzle-orientation";
export { experimentalStickerings } from "../stickerings/puzzle-stickerings";

export {
  customPGPuzzleLoader as experimentalCustomPGPuzzleLoader,
} from "../customPGPuzzleLoader";
export {
  getFaceletStickeringMask as experimentalGetFaceletStickeringMask,
} from "../stickerings/mask";
export type {
  PieceStickeringMask as ExperimentalPieceStickeringMask,
  FaceletMeshStickeringMask as ExperimentalFaceletMeshStickeringMask,
  StickeringMask as ExperimentalStickeringMask,
} from "../stickerings/mask";
export {
  getPieceStickeringMask as experimentalGetPieceStickeringMask,
  PieceStickering as ExperimentalPieceStickering,
} from "../stickerings/mask";
