import { TwistyViewerElement } from "./TwistyViewerElement";

// <twisty-3d-canvas>
export class Twisty3DCanvas extends HTMLElement implements TwistyViewerElement {
  // camera: Camera;
  // renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  // private scheduler = new RenderScheduler(this.render.bind(this));
  constructor() {
    super();
    // console.log("fooly");
    // /*...*/
    // this.twisty3DScene.addRenderTarget(this);
  }

  scheduleRender(): void {
    // this.scheduler.requestAnimFrame();
  }

  // private render(): void {
  //   /*...*/
  // }
}
