import { TwistyViewerElement } from "./TwistyViewerElement";
import { Cube3D } from "../../../twisty-old/3D/cube3D";
import { Puzzles } from "../../../kpuzzle";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { cube3DCanvasCSS } from "./Cube3DCanvas.css";
import { RenderScheduler } from "../../animation/RenderScheduler";
import {
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";

// <cube-3d-canvas>
export class Cube3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  // camera: Camera;
  // renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private cube3D: Cube3D;
  constructor(cursor?: PositionDispatcher) {
    super();
    this.addCSS(cube3DCanvasCSS);
    // console.log("fooly");
    // /*...*/
    // this.twisty3DScene.addRenderTarget(this);

    this.cube3D = new Cube3D(Puzzles["3x3x3"]); // TODO: Dynamic puzzle
    this.cube3D.newVantage(this.contentWrapper);
    cursor!.addPositionListener(this);
  }

  onPositionChange(position: PuzzlePosition): void {
    const oldPos = {
      state: position.state,
      moves: position.movesInProgress,
    };

    this.cube3D.draw(oldPos);
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
    // this.scheduler.requestAnimFrame();
  }

  private render(): void {
    /*...*/
  }
}

if (customElements) {
  customElements.define("cube-3d-canvas", Cube3DCanvas);
}
