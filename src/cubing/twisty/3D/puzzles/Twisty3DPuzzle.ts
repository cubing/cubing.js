import { Object3D } from "three";
import { PuzzlePosition } from "../../animation/indexer/CursorTypes";

export interface Twisty3DPuzzle extends Object3D {
  onPositionChange(position: PuzzlePosition): void;
}
