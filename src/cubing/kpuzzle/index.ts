export { KPuzzle } from "./KPuzzle";
export type { KTransformation } from "./KTransformation";
export {
  KPuzzleDefinition,
  KTransformationData,
  KStateData,
} from "./KPuzzleDefinition";
export { KState } from "./KState";

import { KPuzzle } from "./KPuzzle";
import { cube3x3x3KPuzzleDefinition } from "./3x3x3/3x3x3.kpuzzle.json";
export const experimental3x3x3KPuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);
