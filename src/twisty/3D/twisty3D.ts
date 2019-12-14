import { PerspectiveCamera, Renderer, Scene, Vector3, WebGLRenderer } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { Cursor } from "../cursor";
import { Puzzle } from "../puzzle";

const SHOW_STATS = false;

export const TAU = Math.PI * 2;

const useResizeObserver = window && "ResizeObserver" in window;

// TODO: Turn into class?
export class Vantage {
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  private rafID: number | null = null;
  private stats: Stats | null = null;
  private shift: number = 0 ;
  constructor(public element: HTMLElement, private scene: Scene, options: VantageOptions = {}) {
    this.camera = new PerspectiveCamera(15, element.offsetWidth / element.offsetHeight, 0.1, 1000);
    this.camera.position.copy(options.position ? options.position : defaultVantagePosition);
    this.camera.lookAt(new Vector3(0, 0, 0));

    this.renderer = /*options.renderer ? options.renderer : */createDefaultRenderer();
    this.shift = options.shift ? options.shift : 0 ;
    this.resize();

    this.render();

    if (SHOW_STATS) {
      this.stats = Stats();
      this.stats.dom.style.position = "absolute";
      element.appendChild(this.stats.dom);
    }

    // TODO: Handle Safari (use a polyfill?)
    if (useResizeObserver) {
      const observer = new window.ResizeObserver(this.resize.bind(this));
      observer.observe(this.element);
    }
    element.appendChild(this.renderer.domElement);
  }

  // TODO: Use a coarser debounce?
  public resize(): void {
    if (this.rafID !== null) {
      return;
    }
    this.rafID = requestAnimationFrame(this.scheduledResize.bind(this));
  }

  public render(): void {
    if (this.stats) {
      this.stats.begin();
    }
    this.renderer.render(this.scene, this.camera);
    if (this.stats) {
      this.stats.end();
    }
  }

  private scheduledResize(): void {
    const w = this.element.offsetWidth;
    const h = this.element.offsetHeight;
    let off = 0 ;
    if (this.shift > 0) {
       off = Math.max(0, Math.floor((w - h) * 0.5)) ;
    } else if (this.shift < 0) {
       off = - Math.max(0, Math.floor((w - h) * 0.5)) ;
    }
    let yoff = 0 ;
    let excess = 0 ;
    if (h > w) {
       excess = h - w ;
       yoff = -Math.floor(0.5 * excess) ;
    }
    this.camera.aspect = w / h ;
    this.camera.setViewOffset(w, h - excess, off, yoff, w, h) ;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(pixelRatio());
    // TODO: Add a canvas wrapping class to handle sizing.
    this.renderer.setSize(w, h, false);
    this.render();

    this.rafID = null;
  }
}

export interface VantageOptions {
  position?: Vector3;
  renderer?: Renderer;
  shift?: number;
}

// TODO: Handle if you move across screens?
function pixelRatio(): number {
  return devicePixelRatio || 1;
}

const defaultVantagePosition = new Vector3(1.25, 2.5, 2.5);
function createDefaultRenderer(): WebGLRenderer {
  return new WebGLRenderer({
    antialias: true,
    alpha: true,
  });
}

export abstract class Twisty3D<P extends Puzzle> {
  // TODO: Expose scene or allow providing a partial scene.
  protected scene: Scene;
  protected vantages: Vantage[] = [];
  constructor() {
    this.scene = new Scene();
  }

  public newVantage(element: HTMLElement, options?: VantageOptions): Vantage {
    const vantage = new Vantage(element, this.scene, options);
    this.vantages.push(vantage);
    return vantage;
  }

  public draw(p: Cursor.Position<P>): void {
    this.updateScene(p);
    for (const vantage of this.vantages) {
      vantage.render();
    }
  }

  public experimentalGetScene(): Scene {
    return this.scene;
  }

  public experimentalGetVantages(): Vantage[] {
    return this.vantages;
  }

  protected abstract updateScene(p: Cursor.Position<P>): void;
}
