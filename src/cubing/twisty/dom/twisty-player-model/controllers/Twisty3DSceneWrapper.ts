import type { Scene as ThreeScene } from "three";
import type { Schedulable } from "../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { THREEJS } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import { StaleDropper } from "./PromiseFreshener";
import { Twisty3DPuzzleWrapper } from "./Twisty3DPuzzleWrapper";
import type { Twisty3DVantage } from "./Twisty3DVantage";

export class Twisty3DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  constructor(public model?: TwistyPlayerModel) {
    super();
    this.model?.puzzleProp.addFreshListener(this.onPuzzle.bind(this));
  }

  async connectedCallback(): Promise<void> {}

  #cachedScene: Promise<ThreeScene> | null;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () => new (await THREEJS).Scene())());
  }

  #vantages: Set<Twisty3DVantage> = new Set();
  addVantage(vantage: Twisty3DVantage) {
    this.#vantages.add(vantage);
  }

  removeVantage(vantage: Twisty3DVantage) {
    this.#vantages.delete(vantage);
  }

  scheduleRender(): void {
    for (const vantage of this.#vantages) {
      vantage.scheduleRender();
    }
  }

  #currentTwisty3DPuzzleWrapper: Twisty3DPuzzleWrapper | null = null;
  #staleTwisty3DPuzzleWrappers: Twisty3DPuzzleWrapper[] = []; // TODO: Animate these out.

  #twisty3DStaleDropper: StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]> =
    new StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]>();

  async onPuzzle(puzzle: PuzzleID): Promise<void> {
    console.log("foosy");
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
    const [scene, twisty3DPuzzleWrapper] =
      // await this.#twisty3DStaleDropper.queue( // TODO: Why doesn't this work?
      await Promise.all([
        this.scene(),
        Twisty3DPuzzleWrapper.fromPuzzleID(this.model!, this, puzzle), // TODO
      ]);
    // );
    console.log({ twisty3DPuzzleWrapper });
    const old = this.#currentTwisty3DPuzzleWrapper;
    if (old) {
      this.#staleTwisty3DPuzzleWrappers.push(old);
      scene.remove(old.twisty3D);
      // old.disconnect();
      this.scheduleRender();
    }
    this.#currentTwisty3DPuzzleWrapper = twisty3DPuzzleWrapper;

    // Go!
    scene.add(twisty3DPuzzleWrapper.twisty3D);
    this.scheduleRender();
  }
}

customElementsShim.define("twisty-3d-scene-wrapper", Twisty3DSceneWrapper);
