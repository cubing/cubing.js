import type { PerspectiveCamera, WebGLRenderer } from "three";
import { Stats } from "../../../vendor/three/examples/jsm/libs/stats.modified.module";
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
import { newRenderer, renderPooled } from "./RendererPool";
import { DEGREES_PER_RADIAN } from "./TAU";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { TwistyOrbitControlsV2 } from "./TwistyOrbitControlsV2";
import { DragTracker, PressInfo } from "./DragTracker";

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

let shareAllNewRenderers: boolean | null = null;

// WARNING: The current shared renderer implementation is not every efficient.
// Avoid using for players that are likely to have dimensions approaching 1 megapixel or higher.
// TODO: use a dedicated renderer while fullscreen?
// - true: Force all new (i.e. constructed in the future) renderers to be shared
// - false: Force all new (i.e. constructed in the future) renderers to be dedicated
// - null: Reset to the default heuristics.
export function experimentalForceNewRendererSharing(
  share: boolean | null,
): void {
  shareAllNewRenderers = share;
}

let dedicatedRenderersSoFar = 0;
const DEFAULT_MAX_DEDICATED_RENDERERS = 2; // This allows for a front view and a back view (or two separate front views).
function shareRenderer(): boolean {
  if (shareAllNewRenderers !== null) {
    if (!shareAllNewRenderers) {
      dedicatedRenderersSoFar++;
    }
    return shareAllNewRenderers;
  }
  if (dedicatedRenderersSoFar < DEFAULT_MAX_DEDICATED_RENDERERS) {
    dedicatedRenderersSoFar++;
    return false;
  } else {
    return true;
  }
}

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  private rendererIsShared: boolean = shareRenderer();

  constructor(
    private model?: TwistyPlayerModel,
    scene?: Twisty3DSceneWrapper,
    private options?: { backView?: boolean },
  ) {
    super();
    this.scene = scene ?? null;

    if (SHOW_STATS) {
      this.stats = new Stats();
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
    this.#testBasicPresses();

    this.scheduleRender();
  }

  async #testBasicPresses(): Promise<void> {
    const dragTracker = await this.#dragTracker();
    dragTracker.addEventListener("press", (e: CustomEvent<PressInfo>) => {
      console.log(e.detail, "hi");
    });
  }

  #onResizeStaleDropper = new StaleDropper<PerspectiveCamera>();

  // TODO: Why doesn't this work for the top-right back view height?
  #width: number = 0;
  #height: number = 0;
  async #onResize(): Promise<void> {
    const camera = await this.#onResizeStaleDropper.queue(this.camera());

    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    this.#width = w;
    this.#height = h;
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

    if (this.rendererIsShared) {
      const canvas = await this.canvas();
      canvas.width = w * pixelRatio();
      canvas.height = h * pixelRatio();
      canvas.style.width = w.toString();
      canvas.style.height = w.toString();
    } else {
      (await this.renderer()).setSize(w, h, true);
    }

    this.scheduleRender();
  }

  #cachedRenderer: Promise<WebGLRenderer> | null = null;
  async renderer(): Promise<WebGLRenderer> {
    if (this.rendererIsShared) {
      throw new Error("renderer expected to be shared.");
    }
    return (this.#cachedRenderer ??= newRenderer());
  }

  #cachedCanvas: Promise<HTMLCanvasElement> | null = null;
  async canvas(): Promise<HTMLCanvasElement> {
    return (this.#cachedCanvas ??= (async () => {
      if (this.rendererIsShared) {
        return this.addElement(document.createElement("canvas"));
      }
      const renderer = await this.renderer();
      return this.addElement(renderer.domElement);
    })());
  }

  #cachedDragTracker: Promise<DragTracker> | null = null;
  async #dragTracker(): Promise<DragTracker> {
    return (this.#cachedDragTracker ??= (async () => {
      return new DragTracker(await this.canvas());
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
        await this.#dragTracker(),
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

    const [scene, camera, canvas] = await Promise.all([
      this.scene.scene(),
      this.camera(),
      this.canvas(),
    ]);
    if (this.rendererIsShared) {
      renderPooled(this.#width, this.#height, canvas, scene, camera);
    } else {
      (await this.renderer()).render(scene, camera);
    }

    this.stats?.end();
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    // console.log("scheduling", this);
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage-v2", Twisty3DVantage);
