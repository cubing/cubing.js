import { KPuzzle } from "../../kpuzzle";

export { experimentalIs3x3x3Solved } from "../implementations/dynamic/3x3x3/puzzle-orientation";
export { experimentalStickerings } from "../stickerings/puzzle-stickerings";

import { cube3x3x3KPuzzleDefinition as experimentalCube3x3x3KPuzzleDefinition } from "../implementations/dynamic/3x3x3/3x3x3.kpuzzle.json";
export { experimentalCube3x3x3KPuzzleDefinition };

/** @deprecated */
export const experimental3x3x3KPuzzle = new KPuzzle(
  experimentalCube3x3x3KPuzzleDefinition,
);
