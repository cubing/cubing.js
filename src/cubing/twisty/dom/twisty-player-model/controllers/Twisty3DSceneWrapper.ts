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

  // TODO: Why doesn't this work?
  #twisty3DStaleDropper: StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]> =
    new StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]>();

  async onPuzzle(puzzle: PuzzleID): Promise<void> {
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
    const old = this.#currentTwisty3DPuzzleWrapper;
    if (old) {
      old.disconnect();
    }
    const [scene, twisty3DPuzzleWrapper] =
      await this.#twisty3DStaleDropper.queue(
        Promise.all([
          this.scene(),
          new Twisty3DPuzzleWrapper(this.model!, this, puzzle), // TODO
        ]),
      );

    const newTwisty3DPuzzlePromise = twisty3DPuzzleWrapper.twisty3DPuzzle();

    if (old) {
      this.#staleTwisty3DPuzzleWrappers.push(old);
      (async () => {
        // TODO
        // TODO: Make this more convenient and avoid a flash of missing puzzle.
        // const [oldTwisty3DPuzzle, _] = await Promise.all([
        //   old.twisty3DPuzzle(),
        //   newTwisty3DPuzzlePromise, // We don't remove until the new puzzle is ready.
        // ]);
        // scene.remove(await old.twisty3DPuzzle());
        // console.log("removing", await old.twisty3DPuzzle());
        // this.scheduleRender();
      })();
      // old.disconnect();
    }

    // Go!
    (async () => {
      // TODO: Make this more convenient and avoid a flash of missing puzzle.
      const twisty3D = await newTwisty3DPuzzlePromise;
      for (const child of scene.children) {
        // TODO: This hsouldn't be necessary. Why are we getting duplicate initial instantiations?
        scene.remove(child);
      }
      scene.add(twisty3D);
      this.#currentTwisty3DPuzzleWrapper = twisty3DPuzzleWrapper;
      console.log("adding", await newTwisty3DPuzzlePromise);
      this.scheduleRender();
    })();
  }
}

customElementsShim.define("twisty-3d-scene-wrapper", Twisty3DSceneWrapper);
