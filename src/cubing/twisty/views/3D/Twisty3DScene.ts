import type { Scene as ThreeScene } from "three/src/Three.js";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";
import type { Twisty3DRenderTarget } from "./Twisty3DRenderTarget";

export class Twisty3DScene implements Twisty3DRenderTarget {
  private renderTargets: Set<Twisty3DRenderTarget> = new Set();
  public twisty3Ds: Set<Twisty3DPuzzle> = new Set();

  threeJSScene: Promise<ThreeScene> = (async () =>
    new (await bulk3DCode()).ThreeScene())();

  addRenderTarget(renderTarget: Twisty3DRenderTarget): void {
    this.renderTargets.add(renderTarget);
  }

  scheduleRender(): void {
    for (const renderTarget of this.renderTargets) {
      renderTarget.scheduleRender();
    }
  }

  async addTwisty3DPuzzle(twisty3DPuzzle: Twisty3DPuzzle): Promise<void> {
    this.twisty3Ds.add(twisty3DPuzzle);
    (await this.threeJSScene).add(twisty3DPuzzle);
    // TODO: scheduleRender?
  }

  async removeTwisty3DPuzzle(twisty3DPuzzle: Twisty3DPuzzle): Promise<void> {
    this.twisty3Ds.delete(twisty3DPuzzle);
    (await this.threeJSScene).remove(twisty3DPuzzle);
    // TODO: scheduleRender?
  }

  async clearPuzzles(): Promise<void> {
    for (const puz of this.twisty3Ds) {
      (await this.threeJSScene).remove(puz);
    }
    this.twisty3Ds.clear();
    // TODO: scheduleRender?
  }
}
