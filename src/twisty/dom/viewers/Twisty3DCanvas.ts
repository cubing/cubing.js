import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { Twisty3DScene } from "../../3D/Twisty3DScene";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { pixelRatio } from "./canvas";
import { twisty3DCanvasCSS } from "./Twisty3DCanvas.css";
import { TwistyOrbitControls } from "./TwistyOrbitControls";
import { TwistyViewerElement } from "./TwistyViewerElement";

// <twisty-3d-canvas>
export class Twisty3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  private scene: Twisty3DScene;
  public canvas: HTMLCanvasElement;
  public camera: PerspectiveCamera;
  private legacyExperimentalShift: number = 0;
  private orbitControls: TwistyOrbitControls;
  renderer: WebGLRenderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private resizePending: boolean = false;
  constructor(
    scene?: Twisty3DScene,
    options: { cameraPosition?: Vector3; negateCameraPosition?: boolean } = {},
  ) {
    super();
    this.addCSS(twisty3DCanvasCSS);

    this.scene = scene!;
    this.scene.addRenderTarget(this);

    // TODO: share a pool of renderers.
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true, // TODO
    });
    // We rely on the resize logic to handle renderer dimensions.

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
      this.renderer,
      this.scheduleRender.bind(this),
    );

    this.canvas = this.renderer.domElement;
    this.addElement(this.canvas);

    // TODO: Remove this when enough Safari users have `ResizeObserver`.
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(this.onResize.bind(this));
      observer.observe(this);
    }
  }

  public setMirror(partner: Twisty3DCanvas): void {
    this.orbitControls.setMirror(partner.orbitControls);
    partner.orbitControls.setMirror(this.orbitControls);
  }

  protected connectedCallback(): void {
    // Resize as soon as we're in the DOM, to avoid a flash of incorrectly sized content.
    this.resize();
    this.render();
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  private render(): void {
    // Cancel any scheduled frame, since we're rendering right now.
    // We don't need to re-render until something schedules again.
    this.scheduler.cancelAnimFrame();
    if (this.resizePending) {
      this.resize();
    }
    this.orbitControls.updateAndSchedule();
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.resizePending = true;
    this.scheduleRender();
  }

  private resize(): void {
    this.resizePending = false;

    const w = this.contentWrapper.offsetWidth;
    const h = this.contentWrapper.offsetHeight;
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

    this.renderer.setPixelRatio(pixelRatio());
    this.renderer.setSize(w, h, true);

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
      console.log(tempCanvas);
      return tempCanvas.toDataURL();
    }
  }
}

if (customElements) {
  customElements.define("twisty-3d-canvas", Twisty3DCanvas);
}
