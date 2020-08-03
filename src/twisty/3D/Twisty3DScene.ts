import { Scene as ThreeScene, PointLight } from "three";
import { Twisty3DRenderTarget } from "./Twisty3DRenderTarget";
import { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";

export class Twisty3DScene extends ThreeScene implements Twisty3DRenderTarget {
  private renderTargets: Set<Twisty3DRenderTarget> = new Set();
  private twisty3Ds: Set<Twisty3DPuzzle> = new Set();

  constructor() {
    super();

    const lights = [];
    lights[0] = new PointLight(0xffffff, 1, 0);
    lights[1] = new PointLight(0xffffff, 1, 0);
    lights[2] = new PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.add(lights[0]);
    this.add(lights[1]);
    this.add(lights[2]);
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
  }
}
