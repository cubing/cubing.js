import type { Camera, PerspectiveCamera, Renderer } from "three";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { TwistyOrbitControls } from "../../viewers/TwistyOrbitControls";
import { THREEJS } from "../heavy-code-imports/3d";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  constructor(scene?: Twisty3DSceneWrapper) {
    super();
    this.scene = scene ?? null;
  }

  async connectedCallback(): Promise<void> {
    this.addElement(await this.canvas());
  }

  #cachedRenderer: Promise<Renderer> | null = null;
  async renderer(): Promise<Renderer> {
    return (this.#cachedRenderer ??= (async () => {
      const rendererConstructor = (await THREEJS).WebGLRenderer;
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
      const camera = new (await THREEJS).PerspectiveCamera(
        20,
        1, // We rely on the resize logic to handle this.
        0.1,
        20,
      );
      camera.position.copy(new (await THREEJS).Vector3(2, 4, 4));
      camera.lookAt(0, 0, 0);
      // TODO: `TwistyOrbitControls` breaks isolateion
      const orbitControls = new TwistyOrbitControls(
        camera,
        await this.canvas(),
        this.scheduleRender.bind(this),
      );
      console.log({ orbitControls });
      return camera;
    })());
  }

  async render(): Promise<void> {
    if (!this.scene) {
      throw new Error("Attempted to render without a scene");
    }

    const [renderer, scene, camera] = await Promise.all([
      this.renderer(),
      this.scene.scene(),
      this.camera(),
    ]);
    renderer.render(scene, camera); // TODO
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantage);
