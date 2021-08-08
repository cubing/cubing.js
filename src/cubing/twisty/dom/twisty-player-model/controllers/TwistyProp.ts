import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";

class Twisty3DScene extends ManagedCustomElement {
  constructor(public model: TwistyPlayerModel) {
    super();
  }

  // async scene(): Twisty3DScene {}
}

customElementsShim.define("twisty-3d-scene", Twisty3DScene);
