export { KPuzzle } from "./KPuzzle";
export type {
  KPuzzleDefinition,
  KStateData,
  KTransformationData,
} from "./KPuzzleDefinition";
export { KState } from "./KState";
export { KTransformation } from "./KTransformation";

import { cube3x3x3KPuzzleDefinition } from "./3x3x3/3x3x3.kpuzzle.json";
import { KPuzzle } from "./KPuzzle";
export const experimental3x3x3KPuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);
