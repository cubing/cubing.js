import { PerspectiveCamera, Vector3, WebGLRenderer } from "three";
import { Twisty3DScene } from "../../3D/Twisty3DScene";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { pixelRatio } from "./canvas";
import { twisty3DCanvasCSS } from "./Twisty3DCanvas.css";
import { TwistyViewerElement } from "./TwistyViewerElement";

// <twisty-3d-canvas>
export class Twisty3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  private scene: Twisty3DScene;
  public canvas: HTMLCanvasElement;
  public camera: PerspectiveCamera;
  private legacyExperimentalShift: number = 0;
  renderer: WebGLRenderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private resizePending: boolean = false;
  constructor(
    scene?: Twisty3DScene,
    options: { cameraPosition?: Vector3 } = {},
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
    console.log(options);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.canvas = this.renderer.domElement;
    this.addElement(this.canvas);

    const observer = new window.ResizeObserver(this.onResize.bind(this));
    observer.observe(this);
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
    if (this.resizePending) {
      this.resize();
    }
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
    this.renderer.setSize(w, h);
    this.scheduleRender();
  }
}

if (customElements) {
  customElements.define("twisty-3d-canvas", Twisty3DCanvas);
}
