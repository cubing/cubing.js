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
  PuzzleGeometry,
  StickerDat,
} from "../../puzzle-geometry";
import { Cube3D } from "../3D/puzzles/Cube3D";
import { PG3D } from "../3D/puzzles/PG3D";
import { Twisty3DPuzzle } from "../3D/puzzles/Twisty3DPuzzle";
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
import {
  BackViewLayout,
  backViewLayouts,
  TwistyViewerWrapper,
} from "./viewers/TwistyViewerWrapper";

export type VisualizationFormat = "2D" | "3D" | "PG3D"; // Remove `Twisty3D`
const visualizationFormats: VisualizationFormat[] = ["2D", "3D", "PG3D"];

export interface LegacyExperimentalPG3DViewConfig {
  def: KPuzzleDefinition;
  stickerDat: StickerDat;
  experimentalPolarVantages?: boolean;
  sideBySide?: boolean;
  showFoundation?: boolean;
  experimentalInitialVantagePosition?: Vector3;
}

export type BackgroundTheme = "none" | "checkered";
const backgroundThemes: BackgroundTheme[] = ["none", "checkered"];

export type ControlsLocation = "none" | "bottom-row";
const controlsLocations: ControlsLocation[] = ["none", "bottom-row"];

export interface TwistyPlayerInitialConfig {
  alg?: Sequence;
  puzzle?: string;
  visualization?: VisualizationFormat;
  background?: BackgroundTheme;
  controls?: ControlsLocation;

  legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig;
  backView?: BackViewLayout;
}

class TwistyPlayerConfig {
  alg: Sequence;
  puzzle: string;
  visualization: VisualizationFormat;
  experimentalBackView: BackViewLayout;
  background: BackgroundTheme;
  controls: ControlsLocation;
  constructor(initialConfig: TwistyPlayerInitialConfig) {
    this.alg = initialConfig.alg ?? new Sequence([]);
    this.puzzle = initialConfig.puzzle ?? "3x3x3";
    this.visualization = initialConfig.visualization ?? "3D";
    this.experimentalBackView = initialConfig.backView ?? "none";
    this.background = initialConfig.background ?? "checkered";
    this.controls = initialConfig.controls ?? "bottom-row";
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
  #viewerWrapper: TwistyViewerWrapper;
  #cursor: AlgCursor;
  #currentConfig: TwistyPlayerConfig;
  #cachedTwisty3DScene: Twisty3DScene | null = null;
  #cachedTwisty3DPuzzle: Twisty3DPuzzle | null = null;
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

    const viewers = this.createViewers(
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

    // TODO: specify exactly when back views are possible.
    // TODO: Are there any SVGs where we'd want a separate back view?
    const setBackView: boolean =
      this.#currentConfig.experimentalBackView &&
      this.#currentConfig.visualization !== "2D";
    const backView = setBackView
      ? this.#currentConfig.experimentalBackView
      : "none";
    this.#viewerWrapper = new TwistyViewerWrapper({
      checkered: this.#currentConfig.background === "checkered",
      backView,
    });
    this.addElement(this.#viewerWrapper);

    this.contentWrapper.classList.add(
      `controls-${this.#currentConfig.controls}`,
    );

    this.viewers.map((el) => this.#viewerWrapper.addElement(el));
    this.addElement(this.controls[0]);
    this.addElement(this.controls[1]);

    this.addCSS(twistyPlayerCSS);
  }

  protected createViewers(
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
        const [kpuzzleDef, stickerDat, cameraPosition] = this.pgHelper(
          puzzleName,
        );

        try {
          this.#cursor = new AlgCursor(timeline, kpuzzleDef, alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.#cursor = new AlgCursor(timeline, kpuzzleDef, new Sequence([]));
        }

        this.#cachedTwisty3DScene = new Twisty3DScene();
        const pg3d = new PG3D(
          this.#cursor,
          this.#cachedTwisty3DScene.scheduleRender.bind(
            this.#cachedTwisty3DScene,
          ),
          kpuzzleDef,
          stickerDat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation ?? true,
        );
        this.#cachedTwisty3DPuzzle = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        this.#cachedTwisty3DScene.addTwisty3DPuzzle(this.#cachedTwisty3DPuzzle);
        const viewers = [
          new Twisty3DCanvas(this.#cachedTwisty3DScene, { cameraPosition }),
        ];
        if (backView) {
          viewers.push(
            new Twisty3DCanvas(this.#cachedTwisty3DScene, {
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

  // TODO: Distribute this code better.
  private pgHelper(
    puzzleName: string,
  ): [KPuzzleDefinition, StickerDat, Vector3 | undefined] {
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
    return [kpuzzleDef, stickerDat, cameraPosition];
  }

  setAlg(alg: Sequence): void {
    this.#currentConfig.alg = alg;
    this.#cursor.setAlg(this.#currentConfig.alg);
  }

  setPuzzle(
    puzzleName: string,
    legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig,
  ): void {
    this.#currentConfig.puzzle = puzzleName;
    this.legacyExperimentalPG3DViewConfig =
      legacyExperimentalPG3DViewConfig ?? null;
    switch (this.#currentConfig.visualization) {
      // TODO: Swap out both 3D implementations with each other.
      case "PG3D": {
        console.log("pg3d");
        const scene = this.#cachedTwisty3DScene!;
        scene.remove(this.#cachedTwisty3DPuzzle!);
        this.#cursor.removePositionListener(this.#cachedTwisty3DPuzzle!);
        const [def, dat /*, _*/] = this.pgHelper(this.#currentConfig.puzzle);
        const pg3d = new PG3D(
          this.#cursor,
          scene.scheduleRender.bind(scene),
          def,
          dat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation,
        );
        scene.addTwisty3DPuzzle(pg3d);
        this.#cursor.setPuzzle(def);
        this.#cachedTwisty3DPuzzle = pg3d;
        for (const viewer of this.viewers) {
          viewer.scheduleRender();
        }
        return;
      }

      // this.#cursor.set
      // return;
    }

    // Fallback
    const oldCursor = this.#cursor;
    const viewers = this.createViewers(
      this.timeline,
      this.#currentConfig.alg,
      this.#currentConfig.visualization,
      puzzleName,
      this.#currentConfig.experimentalBackView !== "none",
    );
    this.timeline.removeCursor(oldCursor);
    this.timeline.removeTimestampListener(oldCursor);
    for (const oldViewer of this.viewers) {
      this.#viewerWrapper.removeElement(oldViewer);
    }
    for (const viewer of viewers.reverse()) {
      this.#viewerWrapper.prependElement(viewer);
    }
    this.viewers = viewers;
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  experimentalAddMove(move: BlockMove, coalesce: boolean = false): void {
    const oldNumMoves = countMoves(this.#currentConfig.alg); // TODO
    const newAlg = experimentalAppendBlockMove(
      this.#currentConfig.alg,
      move,
      coalesce,
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

    const backgroundAttribute = this.getAttribute("background"); // TODO: does this conflict with an HTML attribute?
    if (
      backgroundAttribute &&
      (backgroundThemes as string[]).includes(backgroundAttribute)
    ) {
      config.background = backgroundAttribute as BackgroundTheme;
    }

    const controlsAttribute = this.getAttribute("controls"); // TODO: does this conflict with an HTML attribute?
    if (
      controlsAttribute &&
      (controlsLocations as string[]).includes(controlsAttribute)
    ) {
      config.controls = controlsAttribute as ControlsLocation;
    }
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player", TwistyPlayer);
}
