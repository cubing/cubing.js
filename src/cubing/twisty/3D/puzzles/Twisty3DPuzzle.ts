import type { Object3D } from "three";
import type { PuzzlePosition } from "../../animation/cursor/CursorTypes";

export interface Twisty3DPuzzle extends Object3D {
  onPositionChange(position: PuzzlePosition): void;
}

// @ts-ignore https://github.com/snowpackjs/snowpack/discussions/1589#discussioncomment-130176
const _SNOWPACK_HACK = true;
