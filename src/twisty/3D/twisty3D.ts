import * as THREE from "three";

import { Cursor } from "../cursor";
import { Puzzle } from "../puzzle";

import { Scene } from "three";

export const TAU = Math.PI * 2;

const useResizeObserver = window && "ResizeObserver" in window;

// TODO: Turn into class?
export class Vantage {
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private rafID: number | null = null;
  constructor(public element: HTMLElement, private scene: Scene, options: VantageOptions = {}) {
    this.camera = new THREE.PerspectiveCamera(30, element.offsetWidth / element.offsetHeight, 0.1, 1000);
    this.camera.position.copy(options.position ? options.position : defaultVantagePosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer = /*options.renderer ? options.renderer : */createDefaultRenderer();
    this.resize();

    this.renderer.render(this.scene, this.camera);

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

  private scheduledResize(): void {
    const w = this.element.offsetWidth;
    const h = this.element.offsetHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(pixelRatio());
    // TODO: Add a canvas wrapping class to handle sizing.
    this.renderer.setSize(w, h, false);
    this.renderer.render(this.scene, this.camera);

    this.rafID = null;
  }
}

export interface VantageOptions {
  position?: THREE.Vector3;
  renderer?: THREE.Renderer;
}

// TODO: Handle if you move across screens?
function pixelRatio(): number {
  return devicePixelRatio || 1;
}

const defaultVantagePosition = new THREE.Vector3(1.25, 2.5, 2.5);
function createDefaultRenderer(): THREE.WebGLRenderer {
  return new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    // TODO: We're using this so we can save pictures of WebGL canvases.
    // Investigate if there's a significant performance penalty.
    // Better yet, allow rendering to a CanvasRenderer view separately.
    preserveDrawingBuffer: true,
  });
}

export abstract class Twisty3D<P extends Puzzle> {
  // TODO: Expose scene or allow providing a partial scene.
  protected scene: THREE.Scene;
  protected vantages: Vantage[] = [];
  constructor() {
    this.scene = new THREE.Scene();
  }

  public newVantage(element: HTMLElement, options?: VantageOptions): Vantage {
    const vantage = new Vantage(element, this.scene, options);
    this.vantages.push(vantage);
    return vantage;
  }

  public draw(p: Cursor.Position<P>): void {
    this.updateScene(p);
    for (const vantage of this.vantages) {
      vantage.renderer.render(this.scene, vantage.camera);
    }
  }

  protected abstract updateScene(p: Cursor.Position<P>): void;
}
