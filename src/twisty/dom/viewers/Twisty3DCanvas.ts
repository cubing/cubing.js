import { RenderScheduler } from "../../animation/RenderScheduler";
import { Renderer, Camera } from "three";
import { TwistyViewerElement } from "./TwistyViewerElement";
import { Twisty3DScene } from "../../3D/3D";

// <twisty-3d-canvas>
export class Twisty3DCanvas extends HTMLElement implements TwistyViewerElement {
  camera: Camera;
  renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  constructor(private twisty3DScene: Twisty3DScene) {
    super();
    /*...*/
    this.twisty3DScene.addRenderTarget(this);
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  private render(): void {
    /*...*/
  }
}
