import { Object3D } from "three";
import { PuzzlePosition } from "../../animation/alg/CursorTypes";

export interface Twisty3DPuzzle extends Object3D {
  onPositionChange(position: PuzzlePosition): void;
}

// export abstract class Twisty3DPuzzle extends Object3D
//   implements PositionListener {
//   constructor(
//     protected twisty3DScene: Twisty3DScene,
//     cursor: PositionDispatcher,
//   ) {
//     super();
//     /*...*/
//     cursor.addPositionListener(this);
//   }

//   onPositionChange(_position: PuzzlePosition): void {
//     this.twisty3DScene.scheduleRender();
//   }
// }
