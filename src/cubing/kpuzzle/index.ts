export { KPuzzle } from "./KPuzzle";
export type {
  KPuzzleDefinition,
  KStateData,
  KTransformationData,
} from "./KPuzzleDefinition";
export { KState } from "./KState";
export { KTransformation } from "./KTransformation";

import { experimentalCube3x3x3KPuzzleDefinition } from "../puzzles/cubing-private";
import { KPuzzle } from "./KPuzzle";
/** @deprecated */
export const experimental3x3x3KPuzzle = new KPuzzle(experimentalCube3x3x3KPuzzleDefinition);
