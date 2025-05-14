import type { PerspectiveCamera, WebGLRenderer } from "three/src/Three.js";
import { Stats } from "../../../vendor/mit/three/examples/jsm/libs/stats.modified.module";
import { RenderScheduler } from "../../controllers/RenderScheduler";
import { twistyDebugGlobals } from "../../debug";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import { StaleDropper } from "../../model/PromiseFreshener";
import type { DragInputMode } from "../../model/props/puzzle/state/DragInputProp";
import type { TwistyPropParent } from "../../model/props/TwistyProp";
import type { OrbitCoordinates } from "../../model/props/viewer/OrbitCoordinatesRequestProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { pixelRatio } from "../canvas";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { DragTracker, type PressInfo } from "./DragTracker";
import { newRenderer, renderPooled } from "./RendererPool";
import { DEGREES_PER_RADIAN } from "./TAU";
import type { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { twisty3DVantageCSS } from "./Twisty3DVantage.css";
import { TwistyOrbitControls } from "./TwistyOrbitControls";

export async function setCameraFromOrbitCoordinates(
  camera: PerspectiveCamera,
  orbitCoordinates: OrbitCoordinates,
  backView: boolean = false,
): Promise<void> {
  const spherical = new (await bulk3DCode()).ThreeSpherical(
    orbitCoordinates.distance,
    (90 - (backView ? -1 : 1) * orbitCoordinates.latitude) / DEGREES_PER_RADIAN,
    ((backView ? 180 : 0) + orbitCoordinates.longitude) / DEGREES_PER_RADIAN,
  );
  spherical.makeSafe();
  camera.position.setFromSpherical(spherical);
  camera.lookAt(0, 0, 0);
}

let dedicatedRenderersSoFar = 0;
const DEFAULT_MAX_DEDICATED_RENDERERS = 2; // This allows for a front view and a back view (or two separate front views).
let sharingRenderers = false;
function shareRenderer(): boolean {
  if (twistyDebugGlobals.shareAllNewRenderers !== "auto") {
    if (!twistyDebugGlobals.shareAllNewRenderers) {
      dedicatedRenderersSoFar++;
    }
    return twistyDebugGlobals.shareAllNewRenderers !== "never";
  }
  if (dedicatedRenderersSoFar < DEFAULT_MAX_DEDICATED_RENDERERS) {
    dedicatedRenderersSoFar++;
    return false;
  } else {
    sharingRenderers = true;
    return true;
  }
}

export function haveStartedSharingRenderers(): boolean {
  return sharingRenderers;
}

export class Twisty3DVantage extends ManagedCustomElement {
  scene: Twisty3DSceneWrapper | null = null;

  stats: Stats | null = null;

  private rendererIsShared: boolean = shareRenderer();

  loadingElement: HTMLDivElement | null = null;
  constructor(
    private model?: TwistyPlayerModel,
    scene?: Twisty3DSceneWrapper,
    private options?: { backView?: boolean },
  ) {
    super();
    this.scene = scene ?? null;

    this.loadingElement = this.addElement(document.createElement("div"));
    this.loadingElement.classList.add("loading");

    if (twistyDebugGlobals.showRenderStats) {
      this.stats = new Stats();
      this.stats.dom.style.position = "absolute";
      this.contentWrapper.appendChild(this.stats.dom);
    }
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twisty3DVantageCSS);
    this.addElement((await this.canvasInfo()).canvas);

    this.#onResize();
    const observer = new ResizeObserver(this.#onResize.bind(this));
    observer.observe(this.contentWrapper);
    this.orbitControls(); // Instantiate orbit controls
    this.#setupBasicPresses();

    this.scheduleRender();
  }

  async #setupBasicPresses(): Promise<void> {
    const dragTracker = await this.#dragTracker();
    dragTracker.addEventListener(
      "press",
      (async (e: CustomEvent<PressInfo>) => {
        const movePressInput =
          await this.model!.twistySceneModel.movePressInput.get();
        if (movePressInput !== "basic") {
          return;
        }
        this.dispatchEvent(
          new CustomEvent("press", {
            detail: {
              pressInfo: e.detail,
              cameraPromise: this.camera(),
            },
          }),
        );
      }) as any as EventListener, // TODO
    );
  }

  #onResizeStaleDropper = new StaleDropper<PerspectiveCamera>();

  async clearCanvas(): Promise<void> {
    if (this.rendererIsShared) {
      const canvasInfo = await this.canvasInfo();
      canvasInfo.context.clearRect(
        0,
        0,
        canvasInfo.canvas.width,
        canvasInfo.canvas.height,
      );
    } else {
      const renderer = await this.renderer();
      const context = renderer.getContext();
      context.clear(context.COLOR_BUFFER_BIT);
    }
  }

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

    this.clearCanvas();
    if (this.rendererIsShared) {
      const canvasInfo = await this.canvasInfo();

      canvasInfo.canvas.width = w * pixelRatio();
      canvasInfo.canvas.height = h * pixelRatio();
      canvasInfo.canvas.style.width = `${w.toString()}px`;
      canvasInfo.canvas.style.height = `${h.toString()}px`;
    } else {
      const renderer = await this.renderer();
      renderer.setSize(w, h, true);
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

  #cachedCanvas: Promise<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }> | null = null;
  async canvasInfo(): Promise<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }> {
    return (this.#cachedCanvas ??= (async () => {
      let canvas: HTMLCanvasElement;
      if (this.rendererIsShared) {
        canvas = this.addElement(document.createElement("canvas"));
      } else {
        const renderer = await this.renderer();
        canvas = this.addElement(renderer.domElement);
      }
      this.loadingElement?.remove();
      const context = canvas.getContext("2d")!;
      return { canvas, context };
    })());
  }

  #cachedDragTracker: Promise<DragTracker> | null = null;
  async #dragTracker(): Promise<DragTracker> {
    return (this.#cachedDragTracker ??= (async () => {
      const dragTracker = new DragTracker((await this.canvasInfo()).canvas);
      this.model?.twistySceneModel.dragInput.addFreshListener(
        (dragInputMode: DragInputMode) => {
          let dragInputEnabled = false;
          switch (dragInputMode) {
            case "auto": {
              dragTracker.start();
              dragInputEnabled = true;
              break;
            }
            case "none": {
              dragTracker.stop();
              break;
            }
          }
          this.contentWrapper.classList.toggle(
            "drag-input-enabled",
            dragInputEnabled,
          );
        },
      );
      return dragTracker;
    })());
  }

  #cachedCamera: Promise<PerspectiveCamera> | null = null;
  async camera(): Promise<PerspectiveCamera> {
    return (this.#cachedCamera ??= (async () => {
      const camera = new (await bulk3DCode()).ThreePerspectiveCamera(
        20,
        1, // We rely on the resize logic to handle this.
        0.1,
        20,
      );
      camera.position.copy(
        new (await bulk3DCode()).ThreeVector3(2, 4, 4).multiplyScalar(
          this.options?.backView ? -1 : 1,
        ),
      );
      camera.lookAt(0, 0, 0);
      // TODO: `TwistyOrbitControls` breaks isolateion
      return camera;
    })());
  }

  #cachedOrbitControls: Promise<TwistyOrbitControls> | null = null;
  async orbitControls(): Promise<TwistyOrbitControls> {
    return (this.#cachedOrbitControls ??= (async () => {
      const orbitControls = new TwistyOrbitControls(
        this.model!,
        !!this.options?.backView,
        (await this.canvasInfo()).canvas,
        await this.#dragTracker(),
      );

      if (this.model) {
        this.addListener(
          this.model.twistySceneModel.orbitCoordinates,
          async (orbitCoordinates: OrbitCoordinates) => {
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

  #experimentalNextRenderFinishedCallback: (() => void) | null = null;
  experimentalNextRenderFinishedCallback(callback: () => void): void {
    this.#experimentalNextRenderFinishedCallback = callback;
  }

  async render(): Promise<void> {
    if (!this.scene) {
      throw new Error("Attempted to render without a scene");
    }

    this.stats?.begin();

    const [scene, camera, canvas] = await Promise.all([
      this.scene.scene(),
      this.camera(),
      this.canvasInfo(),
    ]);
    if (this.rendererIsShared) {
      renderPooled(this.#width, this.#height, canvas.canvas, scene, camera);
    } else {
      (await this.renderer()).render(scene, camera);
    }

    this.stats?.end();
    this.#experimentalNextRenderFinishedCallback?.();
    this.#experimentalNextRenderFinishedCallback = null;
  }

  #scheduler = new RenderScheduler(this.render.bind(this));
  scheduleRender(): void {
    // console.log("scheduling", this);
    this.#scheduler.requestAnimFrame();
  }
}

customElementsShim.define("twisty-3d-vantage", Twisty3DVantage);
