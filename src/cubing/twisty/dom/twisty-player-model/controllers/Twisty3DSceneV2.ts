import type { Scene } from "three";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { proxy3D } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";

class Twisty3DSceneV2 extends ManagedCustomElement {
  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  async connectedCallback(): Promise<void> {}

  async scene(): Promise<Scene> {
    return new (await proxy3D()).THREE.Scene();
  }
}

customElementsShim.define("twisty-3d-scene-v2", Twisty3DSceneV2);
