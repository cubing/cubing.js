import { Scene as ThreeScene } from "three";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";
import type { Twisty3DRenderTarget } from "./Twisty3DRenderTarget";

export class Twisty3DScene extends ThreeScene implements Twisty3DRenderTarget {
  private renderTargets: Set<Twisty3DRenderTarget> = new Set();
  public twisty3Ds: Set<Twisty3DPuzzle> = new Set();

  constructor() {
    super();
  }

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
    // TODO: scheduleRender?
  }

  removeTwisty3DPuzzle(twisty3DPuzzle: Twisty3DPuzzle): void {
    this.twisty3Ds.delete(twisty3DPuzzle);
    this.remove(twisty3DPuzzle);
    // TODO: scheduleRender?
  }

  clearPuzzles(): void {
    for (const puz of this.twisty3Ds) {
      this.remove(puz);
    }
    this.twisty3Ds.clear();
    // TODO: scheduleRender?
  }
}
