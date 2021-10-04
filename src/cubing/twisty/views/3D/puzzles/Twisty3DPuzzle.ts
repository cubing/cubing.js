import type { Object3D } from "three";
import type { PuzzlePosition } from "../../../old/animation/cursor/CursorTypes";

export interface Twisty3DPuzzle extends Object3D {
  onPositionChange(position: PuzzlePosition): void;
}
