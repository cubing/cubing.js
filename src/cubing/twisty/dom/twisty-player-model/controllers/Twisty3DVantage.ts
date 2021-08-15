import type { PerspectiveCamera, WebGLRenderer } from "three";
import { Stats } from "../../../../vendor/three/examples/jsm/libs/stats.module.js";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { pixelRatio } from "../../viewers/canvas";
import { twisty3DCanvasCSS } from "../../viewers/Twisty3DCanvas.css_.js";
import { TwistyOrbitControls } from "../../viewers/TwistyOrbitControls";
import { THREEJS } from "../heavy-code-imports/3d";
import { StaleDropper } from "./PromiseFreshener.js";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";

let SHOW_STATS = false;

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  constructor(
    scene?: Twisty3DSceneWrapper,
    private options?: { backView?: boolean },
  ) {
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
    this.addCSS(twisty3DCanvasCSS);
    this.addElement(await this.canvas());

    this.#onResize();
    const observer = new ResizeObserver(this.#onResize.bind(this));
    observer.observe(this.contentWrapper);
  }

  #onResizeStaleDropper = new StaleDropper<
    [PerspectiveCamera, WebGLRenderer]
  >();

  // TODO: Why doesn't this work for the top-right back view height?
  async #onResize(): Promise<void> {
    const [camera, renderer] = await this.#onResizeStaleDropper.queue(
      Promise.all([this.camera(), this.renderer()]),
    );

    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    let off = 0;
    let yoff = 0;
    let excess = 0;
    if (h > w) {
      excess = h - w;
      yoff = -Math.floor(0.5 * excess);
    }
    camera.aspect = w / h;
    camera.setViewOffset(w, h - excess, off, yoff, w, h);
    camera.updateProjectionMatrix(); // TODO

    // if (this.rendererIsShared) {
    //   canvas.width = w * pixelRatio();
    //   canvas.height = h * pixelRatio();
    //   canvas.style.width = w.toString();
    //   canvas.style.height = w.toString();
    // } else {
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(w, h, true);
    console.log(w, h);
    // }

    this.scheduleRender();
  }

  #cachedRenderer: Promise<WebGLRenderer> | null = null;
  async renderer(): Promise<WebGLRenderer> {
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
  async camera(): Promise<PerspectiveCamera> {
    return (this.#cachedCamera ??= (async () => {
      const camera = new (await THREEJS).PerspectiveCamera(
        20,
        1, // We rely on the resize logic to handle this.
        0.1,
        20,
      );
      camera.position.copy(
        new (await THREEJS).Vector3(2, 4, 4).multiplyScalar(
          this.options?.backView ? -1 : 1,
        ),
      );
      camera.lookAt(0, 0, 0);
      // TODO: `TwistyOrbitControls` breaks isolateion
      new TwistyOrbitControls(
        camera,
        await this.canvas(),
        this.scheduleRender.bind(this),
      );
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
