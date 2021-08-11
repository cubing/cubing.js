import type { Camera, PerspectiveCamera, Renderer } from "three";
import { Stats } from "../../../../vendor/three/examples/jsm/libs/stats.module.js";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import {
  CSSSource,
  ManagedCustomElement,
} from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { pixelRatio } from "../../viewers/canvas";
import { TwistyOrbitControls } from "../../viewers/TwistyOrbitControls";
import { THREEJS } from "../heavy-code-imports/3d";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";

let SHOW_STATS = true;

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  constructor(scene?: Twisty3DSceneWrapper) {
    super();
    this.scene = scene ?? null;
    this.scene?.addVantage(this); // TODO

    if (SHOW_STATS) {
      this.stats = Stats();
      this.stats.dom.style.position = "absolute";
      this.contentWrapper.appendChild(this.stats.dom);
    }
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(
      new CSSSource(`
:host {
  width: 256px;
  height: 256px;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
}
`),
    );
    this.addElement(await this.canvas());
  }

  #cachedRenderer: Promise<Renderer> | null = null;
  async renderer(): Promise<Renderer> {
    return (this.#cachedRenderer ??= (async () => {
      const rendererConstructor = (await THREEJS).WebGLRenderer;
      const renderer = new rendererConstructor({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(pixelRatio());
      return renderer;
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

    this.stats?.begin();

    const [renderer, scene, camera] = await Promise.all([
      this.renderer(),
      this.scene.scene(),
      this.camera(),
    ]);
    // console.log("rendering!!!!", renderer, scene, camera);
    renderer.setSize(256, 256);
    renderer.render(scene, camera); // TODO

    this.stats?.end();
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    // console.log("scheduling", this);
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantage);
