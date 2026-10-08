export type { PuzzleGeometryOptions as ExperimentalPuzzleGeometryOptions } from "./Options.ts";
export type {
  StickerDat,
  StickerDatAxis,
  StickerDatFace,
  StickerDatSticker,
} from "./PuzzleGeometry.ts";
// TODO: expose this from PG.
export {
  getPG3DNamedPuzzles,
  getPuzzleDescriptionString,
  getPuzzleGeometryByDesc,
  getPuzzleGeometryByName,
  PGNotation as ExperimentalPGNotation,
  PUZZLE_BASE_SHAPES as EXPERIMENTAL_PUZZLE_BASE_SHAPES,
  PUZZLE_CUT_TYPES as EXPERIMENTAL_PUZZLE_CUT_TYPES,
  type PuzzleBaseShape as ExperimentalPuzzleBaseShape,
  type PuzzleCutDescription as ExperimentalPuzzleCutDescription,
  type PuzzleCutType as ExperimentalPuzzleCutType,
  type PuzzleDescription as ExperimentalPuzzleDescription,
  PuzzleGeometry,
  parsePuzzleDescription,
} from "./PuzzleGeometry.ts";
export { Quat } from "./Quat.ts";
export { schreierSims } from "./SchreierSims.ts";
