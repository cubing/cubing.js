import type { Object3D } from "three/src/Three.js";
import type { ExperimentalStickeringMask } from "../../../../puzzles/cubing-private/index.ts";
import type { PuzzlePosition } from "../../../controllers/AnimationTypes.ts";

export interface Twisty3DPuzzle extends Object3D {
  onPositionChange(position: PuzzlePosition): void;
  setStickeringMask(stickeringMask: ExperimentalStickeringMask): void;
}
