import { PerspectiveCamera, Vector2, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Stats } from "../../../vendor/three/examples/jsm/libs/stats.module";
import { THREEJS } from "../../heavy-code-imports/3d";
import { StaleDropper } from "../../model/PromiseFreshener";
import type { TwistyPropParent } from "../../model/props/TwistyProp";
import type { OrbitCoordinatesV2 } from "../../model/props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { RenderScheduler } from "../../old/animation/RenderScheduler";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import { pixelRatio } from "../../old/dom/viewers/canvas";
import { twisty3DCanvasCSS } from "../../old/dom/viewers/Twisty3DCanvas.css";
import { DEGREES_PER_RADIAN } from "./TAU";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { TwistyOrbitControlsV2 } from "./TwistyOrbitControlsV2";

let SHOW_STATS = false;
export function showStats(enable: boolean): void {
  SHOW_STATS = enable;
}

export async function setCameraFromOrbitCoordinates(
  camera: PerspectiveCamera,
  orbitCoordinates: OrbitCoordinatesV2,
  backView: boolean = false,
): Promise<void> {
  const spherical = new (await THREEJS).Spherical(
    orbitCoordinates.distance,
    (90 - (backView ? -1 : 1) * orbitCoordinates.latitude) / DEGREES_PER_RADIAN,
    ((backView ? 180 : 0) + orbitCoordinates.longitude) / DEGREES_PER_RADIAN,
  );
  spherical.makeSafe();
  camera.position.setFromSpherical(spherical);
  camera.lookAt(0, 0, 0);
}

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
    const off = 0;
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
    this.composer.setSize(w, h);
    this.composer.setPixelRatio(pixelRatio());
    // }

    this.scheduleRender();
  }

  composer: EffectComposer;

  #cachedRenderer: Promise<WebGLRenderer> | null = null;
  async renderer(): Promise<WebGLRenderer> {
    return (this.#cachedRenderer ??= (async () => {
      const rendererConstructor = (await THREEJS).WebGLRenderer;
      const renderer = new rendererConstructor({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(pixelRatio());

      const bloomPass = new UnrealBloomPass(
        new Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85,
      );
      this.composer = new EffectComposer(renderer);
      const scene = await this.scene!.scene();

      const renderScene = new RenderPass(scene, await this.camera());
      this.composer.addPass(renderScene);
      this.composer.addPass(bloomPass);
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
            const camera = await this.camera();
            setCameraFromOrbitCoordinates(
              camera,
              orbitCoordinates,
              this.options?.backView,
            );
            // TODO: Wrap in StaleDropper?

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

    // const [renderer, scene, camera] = await Promise.all([
    //   this.renderer(),
    //   this.scene.scene(),
    //   this.camera(),
    // ]);
    await this.renderer();
    // console.log("rendering!!!!", renderer, scene, camera);
    this.composer.render(); // TODO

    this.stats?.end();
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    // console.log("scheduling", this);
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantage);
