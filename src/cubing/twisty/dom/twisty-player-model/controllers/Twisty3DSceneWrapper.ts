import type { Scene } from "three";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { THREEJS } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import type { Twisty3DVantage } from "./Twisty3DVantage";

export class Twisty3DSceneWrapper extends ManagedCustomElement {
  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  async connectedCallback(): Promise<void> {}

  #cachedScene: Promise<Scene> | null;
  async scene(): Promise<Scene> {
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
}

customElementsShim.define("twisty-3d-scene-wrapper", Twisty3DSceneWrapper);
