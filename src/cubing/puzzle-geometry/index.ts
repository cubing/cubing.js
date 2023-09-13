export {
  getPuzzleDescriptionString,
  getPuzzleGeometryByDesc,
  getPuzzleGeometryByName,
  getPG3DNamedPuzzles,
  parsePuzzleDescription,
  PuzzleGeometry,
} from "./PuzzleGeometry";
export type {
  StickerDat,
  StickerDatAxis,
  StickerDatFace,
  StickerDatSticker,
} from "./PuzzleGeometry";
export {
  parseOptions,
  type PuzzleGeometryOptions as ExperimentalPuzzleGeometryOptions,
} from "./Options";
export { Quat } from "./Quat";
export { schreierSims } from "./SchreierSims";

// TODO: expose this from PG.
export { PGNotation as ExperimentalPGNotation } from "./PuzzleGeometry";

export {
  type PuzzleCutDescription as ExperimentalPuzzleCutDescription,
  type PuzzleDescription as ExperimentalPuzzleDescription,
  PUZZLE_CUT_TYPES as EXPERIMENTAL_PUZZLE_CUT_TYPES,
  type PuzzleCutType as ExperimentalPuzzleCutType,
  PUZZLE_BASE_SHAPES as EXPERIMENTAL_PUZZLE_BASE_SHAPES,
  type PuzzleBaseShape as ExperimentalPuzzleBaseShape,
} from "./PuzzleGeometry";
