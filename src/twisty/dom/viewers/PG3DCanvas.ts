import { KPuzzle } from "../../../kpuzzle";
import { getPuzzleGeometryByName } from "../../../puzzle-geometry";
import { PuzzleName } from "../../../puzzle-geometry/Puzzles";
import { PG3D } from "../../../twisty-old/3D/pg3D";
import {
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { pg3DCanvasCSS } from "./PG3DCanvas.css";
import { TwistyViewerElement } from "./TwistyViewerElement";
import { Vector3 } from "three";

// <twisty-pg3d-canvas>
export class PG3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  // camera: Camera;
  // renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private pg3D: PG3D;
  constructor(cursor?: PositionDispatcher, name: PuzzleName = "Megaminx") {
    super();
    this.addCSS(pg3DCanvasCSS);

    const pg = getPuzzleGeometryByName(name, [
      "orientcenters",
      "true",
      "puzzleorientation",
      JSON.stringify(["U", [0, 1, 0], "F", [0, 0, 1]]),
    ]);
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

    this.pg3D = new PG3D(
      kpuzzleDef,
      stickerDat,
      true, // TODO
    );

    this.pg3D.newVantage(this.contentWrapper, {
      position: new Vector3(2, 4, 4),
    });
    cursor!.addPositionListener(this);
  }

  onPositionChange(position: PuzzlePosition): void {
    const oldPos = {
      state: position.state,
      moves: position.movesInProgress,
    };

    this.pg3D.draw(oldPos);
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
  customElements.define("twisty-pg3d-canvas", PG3DCanvas);
}
