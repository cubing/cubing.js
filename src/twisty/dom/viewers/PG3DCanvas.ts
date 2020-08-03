import { KPuzzle, KPuzzleDefinition } from "../../../kpuzzle";
import {
  getPuzzleGeometryByName,
  PuzzleGeometry,
} from "../../../puzzle-geometry";
import { PuzzleName } from "../../../puzzle-geometry/Puzzles";
import { PG3D } from "../../3D/puzzles/PG3D";
import {
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { pg3DCanvasCSS } from "./PG3DCanvas.css";
import { TwistyViewerElement } from "./TwistyViewerElement";
import { Vector3 } from "three";
import { LegacyExperimentalPG3DViewConfig } from "../TwistyPlayer";

const DEFAULT_PUZZLE_NAME = "3x3x3";

function getPG3DCanvasPG(name: PuzzleName): PuzzleGeometry {
  const pg = getPuzzleGeometryByName(name, [
    "allmoves",
    "true",
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

  return pg;
}

export function getPG3DCanvasDefinition(name: PuzzleName): KPuzzleDefinition {
  return getPG3DCanvasPG(name).writekpuzzle();
}

// <twisty-pg3d-canvas>
export class PG3DCanvas extends ManagedCustomElement
  implements TwistyViewerElement {
  // camera: Camera;
  // renderer: Renderer; // TODO: share renderers across elements? (issue: renderers are not designed to be constantly resized?)
  private scheduler = new RenderScheduler(this.render.bind(this));
  private pg3D: PG3D;
  constructor(
    cursor?: PositionDispatcher,
    name: PuzzleName = DEFAULT_PUZZLE_NAME,
    legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig | null,
  ) {
    super();
    this.addCSS(pg3DCanvasCSS);

    if (legacyExperimentalPG3DViewConfig) {
      this.pg3D = new PG3D(
        legacyExperimentalPG3DViewConfig.def,
        legacyExperimentalPG3DViewConfig.stickerDat,
        legacyExperimentalPG3DViewConfig?.showFoundation ?? true, // TODO
      );
    } else {
      const pg = getPG3DCanvasPG(name);
      const kpuzzleDef = pg.writekpuzzle();
      const worker = new KPuzzle(kpuzzleDef);

      // TODO: are these hacks working here?
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

      this.pg3D = new PG3D(kpuzzleDef, stickerDat, true);
    }

    this.pg3D.newVantage(this.contentWrapper, {
      position: new Vector3(0, 0, 6),
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

  public legacyExperimentalPG3D(): PG3D {
    return this.pg3D;
  }
}

if (customElements) {
  customElements.define("twisty-pg3d-canvas", PG3DCanvas);
}
