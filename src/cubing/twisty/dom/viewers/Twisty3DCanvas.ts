import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { Twisty3DScene } from "../../3D/Twisty3DScene";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { pixelRatio } from "./canvas";
import { twisty3DCanvasCSS } from "./Twisty3DCanvas.css";
import { TwistyOrbitControls } from "./TwistyOrbitControls";
import { TwistyViewerElement } from "./TwistyViewerElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import Stats from "../../../../vendor/node_modules/three/examples/jsm/libs/stats.module";

let SHOW_STATS = false;
// Show render stats for newly contructed renderers.
export function experimentalShowRenderStats(show: boolean): void {
  SHOW_STATS = show;
}

let resizeObserverWarningShown = false;

let shareAllNewRenderers: boolean = false;

// WARNING: The current shared renderer implementation is not every efficient.
// Avoid using for players that are likely to have dimensions approaching 1 megapixel or higher.
// TODO: use a dedicated renderer while fullscreen?
export function experimentalSetShareAllNewRenderers(share: boolean): void {
  shareAllNewRenderers = share;
}

let sharedRenderer: WebGLRenderer | null = null;

function newRenderer(): WebGLRenderer {
  return new WebGLRenderer({
    antialias: true,
    alpha: true, // TODO
  });
}

function newSharedRenderer(): WebGLRenderer {
  return sharedRenderer ?? (sharedRenderer = newRenderer());
}

// <twisty-3d-canvas>
export class Twisty3DCanvas
  extends ManagedCustomElement
  implements TwistyViewerElement {
  private scene: Twisty3DScene;
  public canvas: HTMLCanvasElement;
  public camera: PerspectiveCamera;
  private legacyExperimentalShift: number = 0;
  private orbitControls: TwistyOrbitControls;
  private scheduler = new RenderScheduler(this.render.bind(this));
  private resizePending: boolean = false;

  private renderer: WebGLRenderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private rendererIsShared: boolean;
  private canvas2DContext: CanvasRenderingContext2D;

  private stats: Stats | null = null;

  // TODO: Are there any render duration performance concerns with removing this?
  #invisible: boolean = false;
  constructor(
    scene?: Twisty3DScene,
    options: { cameraPosition?: Vector3; negateCameraPosition?: boolean } = {},
  ) {
    super();
    this.addCSS(twisty3DCanvasCSS);

    this.scene = scene!;
    this.scene.addRenderTarget(this);
    if (SHOW_STATS) {
      this.stats = Stats();
      this.stats.dom.style.position = "absolute";
      this.addElement(this.stats.dom);
    }

    // We rely on the resize logic to handle renderer dimensions.
    this.rendererIsShared = shareAllNewRenderers;
    this.renderer = this.rendererIsShared ? newSharedRenderer() : newRenderer();
    this.canvas = this.rendererIsShared
      ? document.createElement("canvas")
      : this.renderer.domElement;
    this.canvas2DContext = this.canvas.getContext("2d")!; // TODO: avoid saving unneeded?
    this.addElement(this.canvas);

    this.camera = new PerspectiveCamera(
      20,
      1, // We rely on the resize logic to handle this.
      0.1,
      1000,
    );
    this.camera.position.copy(options.cameraPosition ?? new Vector3(2, 4, 4));
    if (options.negateCameraPosition) {
      this.camera.position.multiplyScalar(-1);
    }
    this.camera.lookAt(new Vector3(0, 0, 0)); // TODO: Handle with `negateCameraPosition`
    this.orbitControls = new TwistyOrbitControls(
      this.camera,
      this.canvas,
      this.scheduleRender.bind(this),
    );

    // TODO: Remove this when enough Safari users have `ResizeObserver`.
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(this.onResize.bind(this));
      observer.observe(this.contentWrapper);
    } else {
      this.scheduleRender();
      if (!resizeObserverWarningShown) {
        console.warn(
          "You are using an older browser that does not support `ResizeObserver`. Displayed puzzles will not be rescaled.",
        );
        resizeObserverWarningShown = true;
      }
    }
  }

  public setMirror(partner: Twisty3DCanvas): void {
    this.orbitControls.setMirror(partner.orbitControls);
    partner.orbitControls.setMirror(this.orbitControls);
  }

  /** @deprecated */
  public experimentalSetAltitudeLock(lock: boolean): void {
    this.orbitControls.experimentalAltitudeLock = lock;
  }

  protected connectedCallback(): void {
    // Resize as soon as we're in the DOM, to avoid a flash of incorrectly sized content.
    this.resize();
    this.render();
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  // If the current size/state is incorrect, it may be preferable to hide it
  // briefly, rather than flashing an incorrect version for one frame.
  makeInvisibleUntilRender(): void {
    this.contentWrapper.classList.add("invisible");
    this.#invisible = true;
  }

  private render(): void {
    // Cancel any scheduled frame, since we're rendering right now.
    // We don't need to re-render until something schedules again.
    this.stats?.begin();
    this.scheduler.cancelAnimFrame();
    if (this.resizePending) {
      this.resize();
    }
    this.orbitControls.updateAndSchedule();

    if (this.rendererIsShared) {
      this.renderer.setSize(this.canvas.width, this.canvas.height, false);
      this.canvas2DContext.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }
    this.renderer.render(this.scene, this.camera);
    if (this.rendererIsShared) {
      this.canvas2DContext.drawImage(this.renderer.domElement, 0, 0);
    }

    if (this.#invisible) {
      this.contentWrapper.classList.remove("invisible");
    }
    this.stats?.end();
  }

  private onResize(): void {
    this.resizePending = true;
    this.scheduleRender();
  }

  private resize(): void {
    this.resizePending = false;

    const w = this.contentWrapper.clientWidth;
    const h = this.contentWrapper.clientHeight;
    let off = 0;
    if (this.legacyExperimentalShift > 0) {
      off = Math.max(0, Math.floor((w - h) * 0.5));
    } else if (this.legacyExperimentalShift < 0) {
      off = -Math.max(0, Math.floor((w - h) * 0.5));
    }
    let yoff = 0;
    let excess = 0;
    if (h > w) {
      excess = h - w;
      yoff = -Math.floor(0.5 * excess);
    }
    this.camera.aspect = w / h;
    this.camera.setViewOffset(w, h - excess, off, yoff, w, h);
    this.camera.updateProjectionMatrix(); // TODO

    if (this.rendererIsShared) {
      this.canvas.width = w * pixelRatio();
      this.canvas.height = h * pixelRatio();
      this.canvas.style.width = w.toString();
      this.canvas.style.height = w.toString();
    } else {
      this.renderer.setPixelRatio(pixelRatio());
      this.renderer.setSize(w, h, true);
    }

    this.scheduleRender();
  }

  // Square crop is useful for rending icons.
  renderToDataURL(options: { squareCrop?: boolean } = {}): string {
    // We don't preserve the drawing buffer, so we have to render again and then immediately read the canvas data.
    // https://stackoverflow.com/a/30647502
    this.render();

    // TODO: can we assume that a central crop is similar enough to how a square canvas render would loook?
    if (!options.squareCrop || this.canvas.width === this.canvas.height) {
      // TODO: is this such an uncommon path taht we can skip it?
      return this.canvas.toDataURL();
    } else {
      const tempCanvas = document.createElement("canvas");
      const squareSize = Math.min(this.canvas.width, this.canvas.height);
      tempCanvas.width = squareSize;
      tempCanvas.height = squareSize;
      const tempCtx = tempCanvas.getContext("2d")!; // TODO: can we assume this is always availab?E
      tempCtx.drawImage(
        this.canvas,
        -(this.canvas.width - squareSize) / 2,
        -(this.canvas.height - squareSize) / 2,
      );
      return tempCanvas.toDataURL();
    }
  }
}

customElementsShim.define("twisty-3d-canvas", Twisty3DCanvas);
