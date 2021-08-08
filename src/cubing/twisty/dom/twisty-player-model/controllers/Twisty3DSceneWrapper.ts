import type { Scene } from "three";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { THREEJS } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";

export class Twisty3DSceneWrapper extends ManagedCustomElement {
  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  async connectedCallback(): Promise<void> {}

  #cachedScene: Promise<Scene> | null;
  async scene(): Promise<Scene> {
    return (this.#cachedScene ??= (async () => new (await THREEJS).Scene())());
  }
}

customElementsShim.define("twisty-3d-scene-wrapper", Twisty3DSceneWrapper);
