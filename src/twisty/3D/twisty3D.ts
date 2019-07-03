import * as THREE from "three";

import {Cursor} from "../cursor";
import {Puzzle} from "../puzzle";

export const TAU = Math.PI * 2;

// TODO: Turn into class?
export interface Vantage {
  camera: THREE.Camera;
  renderer: THREE.Renderer;
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
function createDefaultRenderer(): THREE.Renderer {
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

  public newVantage(element: HTMLElement, options: VantageOptions = {}): Vantage {
    const camera = new THREE.PerspectiveCamera(30, element.offsetWidth / element.offsetHeight, 0.1, 1000);
    camera.position.copy(options.position ? options.position : defaultVantagePosition);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = options.renderer ? options.renderer : createDefaultRenderer();
    this.setRendererSize(renderer, element.offsetWidth, element.offsetHeight);

    renderer.render(this.scene, camera);

    element.appendChild(renderer.domElement);
    const vantage = {
      camera,
      renderer,
    };
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

  private setRendererSize(renderer: THREE.Renderer, w: number, h: number): void {
    renderer.setSize(w * pixelRatio(), h * pixelRatio());
    renderer.domElement.width;
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    renderer.domElement.width = w * devicePixelRatio;
    renderer.domElement.height = h * devicePixelRatio;
  }
}
