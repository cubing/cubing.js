import type { PerspectiveCamera, WebGLRenderer } from "three";
import { Stats } from "../../../../../vendor/three/examples/jsm/libs/stats.module.js";
import { DEGREES_PER_RADIAN } from "../../../../3D/TAU.js";
import { RenderScheduler } from "../../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../../element/ManagedCustomElement";
import { customElementsShim } from "../../../element/node-custom-element-shims";
import { pixelRatio } from "../../../viewers/canvas";
import { twisty3DCanvasCSS } from "../../../viewers/Twisty3DCanvas.css_.js";
import { THREEJS } from "../../heavy-code-imports/3d";
import type { OrbitCoordinatesV2 } from "../../props/depth-0/OrbitCoordinatesRequestProp.js";
import type { TwistyPlayerModel } from "../../props/TwistyPlayerModel.js";
import type { TwistyPropParent } from "../../props/TwistyProp.js";
import { StaleDropper } from "../../props/PromiseFreshener.js";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { TwistyOrbitControlsV2 } from "./TwistyOrbitControlsV2.js";

let SHOW_STATS = false;

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  constructor(
    private model?: TwistyPlayerModel,
    scene?: Twisty3DSceneWrapper,
    private options?: { backView?: boolean },
  ) {
    super();
    this.scene = scene ?? null;

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
    this.orbitControls(); // TODO
    this.scheduleRender();
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
      return camera;
    })());
  }

  #cachedOrbitControls: Promise<TwistyOrbitControlsV2> | null = null;
  async orbitControls(): Promise<TwistyOrbitControlsV2> {
    return (this.#cachedOrbitControls ??= (async () => {
      const orbitControls = new TwistyOrbitControlsV2(
        this.model!,
        !!this.options?.backView,
        await this.canvas(),
      );

      if (this.model) {
        this.addListener(
          this.model.orbitCoordinatesProp,
          async (orbitCoordinates: OrbitCoordinatesV2) => {
            const spherical = new (await THREEJS).Spherical(
              orbitCoordinates.distance,
              (90 -
                (this.options?.backView ? -1 : 1) * orbitCoordinates.latitude) /
                DEGREES_PER_RADIAN,
              ((this.options?.backView ? 180 : 0) +
                orbitCoordinates.longitude) /
                DEGREES_PER_RADIAN,
            );
            spherical.makeSafe();

            const camera = await this.camera();

            // TODO: Wrap in StaleDropper?
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
            this.scheduleRender();
          },
        );
      }

      return orbitControls;
    })());
  }

  addListener<T>(
    prop: TwistyPropParent<T>,
    listener: (value: T) => void,
  ): void {
    prop.addFreshListener(listener);
    this.#disconnectionFunctions.push(() => {
      prop.removeFreshListener(listener);
      // disconnected = true; // TODO
    });
  }

  #disconnectionFunctions: (() => void)[] = [];
  disconnect(): void {
    for (const fn of this.#disconnectionFunctions) {
      fn();
    }
    this.#disconnectionFunctions = []; // TODO: Encapsulate this.
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
