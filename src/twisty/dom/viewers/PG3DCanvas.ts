import { TwistyViewerElement } from "./TwistyViewerElement";
import { Cube3D } from "../../../twisty-old/3D/cube3D";
import { Puzzles, KPuzzle } from "../../../kpuzzle";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { pg3DCanvasCSS } from "./PG3DCanvas.css";
import { RenderScheduler } from "../../animation/RenderScheduler";
import {
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { getPuzzleGeometryByName } from "../../../puzzle-geometry";
import { PuzzleName } from "../../../puzzle-geometry/Puzzles";

// <twisty-3d-canvas>
export class Twisty3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  // camera: Camera;
  // renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private cube3D: Cube3D;
  constructor(cursor?: PositionDispatcher, name?: PuzzleName) {
    super();
    this.addCSS(pg3DCanvasCSS);

    const pg = getPuzzleGeometryByName(name!, ["orientcenters", "true"]);
    const kpuzzleDef = pg.writekpuzzle();
    const worker = new KPuzzle(kpuzzleDef);

    // Wide move / rotation hack
    worker.setFaceNames(pg.facenames.map((_: any) => _[1]));
    const mps = pg.movesetgeos;
    for (const mp of mps) {
      const grip1 = mp[0] as string;
      const grip2 = mp[2] as string;
      // angle compatibility hack
      worker.addGrip(grip1, grip2, mp[4] as number);
    }

    const stickerDat = pg.get3d(0.0131);

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
  customElements.define("twisty-3d-canvas", Twisty3DCanvas);
}
