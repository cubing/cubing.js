import type { Camera, PerspectiveCamera, Renderer, WebGLRenderer } from "three";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { proxy3D, THREE } from "../heavy-code-imports/3d";

class Twisty3DVantageV2 extends ManagedCustomElement {
  async connectedCallback(): Promise<void> {
    this.addElement(await this.canvas());
  }

  #cachedRenderer: Promise<Renderer> | null = null;
  async renderer(): Promise<Renderer> {
    return (this.#cachedRenderer ??= (async () => {
      const rendererConstructor = await (async () =>
        (
          await THREE()
        ).WebGLRenderer)();
      return new rendererConstructor({ antialias: true, alpha: true });
    })());
  }

  #cachedCanvas: Promise<HTMLCanvasElement> | null = null;
  async canvas(): Promise<HTMLCanvasElement> {
    return (this.#cachedCanvas ??= (async () => {
      return (await this.renderer()).domElement;
    })());
  }

  #cachedCamera: Promise<PerspectiveCamera> | null = null;
  async camera(): Promise<Camera> {
    return (this.#cachedCamera ??= (async () => {
      const camera = new (await proxy3D()).THREE.PerspectiveCamera(
        20,
        1, // We rely on the resize logic to handle this.
        0.1,
        20,
      );
      camera.position.copy(new (await proxy3D()).THREE.Vector3(2, 4, 4));
      this.orbitControls = new TwistyOrbitControls(
        this.camera,
        this.canvas,
        this.scheduleRender.bind(this),
      );
      return camera;
    })());
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantageV2);
