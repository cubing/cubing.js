import { Vector3 } from "three";
import { countMoves } from "../../../app/twizzle/move-counter";
import {
  BlockMove,
  experimentalAppendBlockMove,
  parse,
  Sequence,
} from "../../alg";
import { KPuzzle, KPuzzleDefinition, Puzzles } from "../../kpuzzle";
import {
  getPuzzleGeometryByName,
  StickerDat,
  PuzzleGeometry,
} from "../../puzzle-geometry";
import { Cube3D } from "../3D/puzzles/Cube3D";
import { PG3D } from "../3D/puzzles/PG3D";
import { Twisty3DScene } from "../3D/Twisty3DScene";
import { AlgCursor } from "../animation/alg/AlgCursor";
import { Timeline } from "../animation/Timeline";
import { TwistyControlButtonPanel } from "./controls/buttons";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { ManagedCustomElement } from "./ManagedCustomElement";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { Twisty3DCanvas } from "./viewers/Twisty3DCanvas";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";

export type VisualizationFormat = "2D" | "3D" | "PG3D"; // Remove `Twisty3D`
const visualizationFormats: VisualizationFormat[] = ["2D", "3D", "PG3D"];

export type BackViewLayout = "none" | "side-by-side" | "upper-right";
const backViewLayouts = ["none", "side-by-side", "upper-right"];

export interface LegacyExperimentalPG3DViewConfig {
  def: KPuzzleDefinition;
  stickerDat: StickerDat;
  experimentalPolarVantages?: boolean;
  sideBySide?: boolean;
  showFoundation?: boolean;
  experimentalInitialVantagePosition?: Vector3;
}

export interface TwistyPlayerInitialConfig {
  alg?: Sequence;
  puzzle?: string;
  visualization?: VisualizationFormat;

  legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig;
  experimentalBackView?: BackViewLayout;
}

class TwistyPlayerConfig {
  alg: Sequence;
  puzzle: string;
  visualization: VisualizationFormat;
  experimentalBackView: BackViewLayout;
  constructor(initialConfig: TwistyPlayerInitialConfig) {
    this.alg = initialConfig.alg ?? new Sequence([]);
    this.puzzle = initialConfig.puzzle ?? "3x3x3";
    this.visualization = initialConfig.visualization ?? "3D";
    this.experimentalBackView = initialConfig.experimentalBackView ?? "none";
  }
}

function createPG(puzzleName: string): PuzzleGeometry {
  const pg = getPuzzleGeometryByName(puzzleName, [
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

// <twisty-player>
export class TwistyPlayer extends ManagedCustomElement {
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  timeline: Timeline;
  #cursor: AlgCursor;
  #currentConfig: TwistyPlayerConfig;
  private legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null;
  public legacyExperimentalCoalesceModFunc: (mv: BlockMove) => number = (
    _mv: BlockMove,
  ): number => 0;

  public legacyExperimentalPG3D: PG3D | null = null;
  // TODO: support config from DOM.
  constructor(initialConfig: TwistyPlayerInitialConfig = {}) {
    super();
    this.#currentConfig = new TwistyPlayerConfig(initialConfig);

    this.legacyExperimentalPG3DViewConfig =
      initialConfig.legacyExperimentalPG3DViewConfig ?? null;
  }

  protected connectedCallback(): void {
    this.processAttributes();

    this.timeline = new Timeline();

    const viewers = this.createMainViewer(
      this.timeline,
      this.#currentConfig.alg,
      this.#currentConfig.visualization,
      this.#currentConfig.puzzle,
      this.#currentConfig.experimentalBackView !== "none",
    );
    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);

    this.viewers = viewers;
    this.controls = [scrubber, controlButtonGrid];

    this.viewers.map((el) => this.addElement(el));
    this.addElement(this.controls[0]);
    this.addElement(this.controls[1]);

    // TODO: specify exactly when back views are possible.
    // TODO: Are there any SVGs where we'd want a separate back view?
    if (this.#currentConfig.visualization !== "2D") {
      this.contentWrapper.classList.add(
        `back-view-${this.#currentConfig.experimentalBackView}`,
      );
    }
    this.addCSS(twistyPlayerCSS);
  }

  protected createMainViewer(
    timeline: Timeline,
    alg: Sequence,
    visualization: VisualizationFormat,
    puzzleName: string,
    backView: boolean,
  ): TwistyViewerElement[] {
    switch (visualization) {
      case "2D":
        try {
          this.#cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.#cursor = new AlgCursor(
            timeline,
            Puzzles[puzzleName],
            new Sequence([]),
          );
        }
        this.timeline.addCursor(this.#cursor);
        this.timeline.jumpToEnd();
        return [new Twisty2DSVG(this.#cursor, Puzzles[puzzleName])];
      case "3D":
        if (puzzleName === "3x3x3") {
          // TODO: fold 3D and PG3D into this.
          try {
            this.#cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg);
          } catch (e) {
            // TODO: Deduplicate fallback.
            this.#cursor = new AlgCursor(
              timeline,
              Puzzles[puzzleName],
              new Sequence([]),
            );
          }
          const scene = new Twisty3DScene();
          const cube3d = new Cube3D(
            this.#cursor,
            scene.scheduleRender.bind(scene),
          );
          scene.addTwisty3DPuzzle(cube3d);
          const viewers = [new Twisty3DCanvas(scene)];
          if (backView) {
            viewers.push(
              new Twisty3DCanvas(scene, {
                // cameraPosition, // TODO
                negateCameraPosition: true,
              }),
            );
          }
          this.timeline.addCursor(this.#cursor);
          this.timeline.jumpToEnd();
          return viewers;
        }
      // fallthrough for 3D when not 3x3x3
      case "PG3D": {
        let kpuzzleDef: KPuzzleDefinition;
        let stickerDat: StickerDat;
        let cameraPosition: Vector3 | undefined = undefined;

        if (this.legacyExperimentalPG3DViewConfig) {
          kpuzzleDef = this.legacyExperimentalPG3DViewConfig.def;
          stickerDat = this.legacyExperimentalPG3DViewConfig.stickerDat;
          // experimentalPolarVantages ?: boolean;
          // sideBySide ?: boolean;
          // showFoundation ?: boolean;
          cameraPosition = this.legacyExperimentalPG3DViewConfig
            .experimentalInitialVantagePosition;
        } else {
          const pg = createPG(puzzleName);
          stickerDat = pg.get3d(0.0131);
          kpuzzleDef = pg.writekpuzzle();
        }

        try {
          this.#cursor = new AlgCursor(timeline, kpuzzleDef, alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.#cursor = new AlgCursor(timeline, kpuzzleDef, new Sequence([]));
        }

        const scene = new Twisty3DScene();
        const pg3d = new PG3D(
          this.#cursor,
          scene.scheduleRender.bind(scene),
          kpuzzleDef,
          stickerDat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation,
        );
        this.legacyExperimentalPG3D = pg3d;
        scene.addTwisty3DPuzzle(pg3d);
        const viewers = [new Twisty3DCanvas(scene, { cameraPosition })];
        if (backView) {
          viewers.push(
            new Twisty3DCanvas(scene, {
              cameraPosition,
              negateCameraPosition: true,
            }),
          );
        }
        this.timeline.addCursor(this.#cursor);
        this.timeline.jumpToEnd();
        return viewers;
      }
    }
  }

  setAlg(alg: Sequence): void {
    this.#currentConfig.alg = alg;
    this.#cursor.setAlg(this.#currentConfig.alg);
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  experimentalAddMove(move: BlockMove): void {
    const oldNumMoves = countMoves(this.#currentConfig.alg); // TODO
    const newAlg = experimentalAppendBlockMove(
      this.#currentConfig.alg,
      move,
      true,
      this.legacyExperimentalCoalesceModFunc(move),
    );

    this.setAlg(newAlg);
    // TODO
    if (oldNumMoves <= countMoves(newAlg)) {
      this.timeline.experimentalJumpToLastMove();
    } else {
      this.timeline.jumpToEnd();
    }
    this.timeline.play();
  }

  fullscreen(): void {
    this.requestFullscreen();
  }

  private processAttributes(): void {
    const config = this.#currentConfig;

    const algAttribute = this.getAttribute("alg");
    if (algAttribute) {
      try {
        config.alg = parse(algAttribute);
      } catch (e) {
        console.log("Invalid initial alg:", e);
      }
    }

    config.puzzle = this.getAttribute("puzzle") ?? config.puzzle;

    const visualizationAttribute = this.getAttribute("visualization");
    if (
      visualizationAttribute &&
      (visualizationFormats as string[]).includes(visualizationAttribute)
    ) {
      config.visualization = visualizationAttribute as VisualizationFormat;
    }

    const backViewAttribute = this.getAttribute("back-view");
    if (
      backViewAttribute &&
      (backViewLayouts as string[]).includes(backViewAttribute)
    ) {
      config.experimentalBackView = backViewAttribute as BackViewLayout;
    }
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player", TwistyPlayer);
}
