import { Scene as ThreeScene, Object3D } from "three";
import {
  PositionDispatcher,
  PositionListener,
  PuzzlePosition,
} from "../animation/alg/AlgCursor";

// This should only be implemented by classes with a private `render()` method
// that draws to the screen.
export interface Twisty3DRenderTarget {
  scheduleRender(): void;
}

export class Twisty3DScene extends ThreeScene implements Twisty3DRenderTarget {
  private renderTargets: Set<Twisty3DRenderTarget> = new Set();
  private twisty3Ds: Set<Twisty3DPuzzle> = new Set();

  addRenderTarget(renderTarget: Twisty3DRenderTarget): void {
    this.renderTargets.add(renderTarget);
  }

  scheduleRender(): void {
    for (const renderTarget of this.renderTargets) {
      renderTarget.scheduleRender();
    }
  }

  addTwisty3DPuzzle(twisty3DPuzzle: Twisty3DPuzzle): void {
    this.twisty3Ds.add(twisty3DPuzzle);
    this.add(twisty3DPuzzle);
  }
}

export class Twisty3DPuzzle extends Object3D implements PositionListener {
  constructor(
    protected twisty3DScene: Twisty3DScene,
    cursor: PositionDispatcher,
  ) {
    super();
    /*...*/
    cursor.addPositionListener(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onPositionChange(position: PuzzlePosition): void {
    /*... update object */
    this.twisty3DScene.scheduleRender();
  }
}
