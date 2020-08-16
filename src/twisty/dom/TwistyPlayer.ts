import { Vector3 } from "three";
import { countMoves } from "../../../app/twizzle/move-counter";
import { BlockMove, experimentalAppendBlockMove, Sequence } from "../../alg";
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
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import {
  BackgroundTheme,
  ControlsLocation,
  PuzzleID,
  TwistyPlayerConfig,
  TwistyPlayerInitialConfig,
  VisualizationFormat,
} from "./TwistyPlayerConfig";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { Twisty3DCanvas } from "./viewers/Twisty3DCanvas";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";
import {
  BackViewLayout,
  TwistyViewerWrapper,
} from "./viewers/TwistyViewerWrapper";

export interface LegacyExperimentalPG3DViewConfig {
  def: KPuzzleDefinition;
  stickerDat: StickerDat;
  experimentalPolarVantages?: boolean;
  sideBySide?: boolean;
  showFoundation?: boolean;
}

function createPG(puzzleName: string): PuzzleGeometry {
  const pg = getPuzzleGeometryByName(puzzleName, [
    "allmoves",
    "true",
    "orientcenters",
    "true",
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
  #config: TwistyPlayerConfig;

  timeline: Timeline;
  cursor: AlgCursor;
  scene: Twisty3DScene | null = null;
  twisty3D: Twisty3DPuzzle | null = null;

  viewerElems: TwistyViewerElement[];
  controlElems: TwistyControlElement[];

  #viewerWrapper: TwistyViewerWrapper;
  public legacyExperimentalCoalesceModFunc: (mv: BlockMove) => number = (
    _mv: BlockMove,
  ): number => 0;

  public legacyExperimentalPG3D: PG3D | null = null;
  // TODO: support config from DOM.
  constructor(
    initialConfig: TwistyPlayerInitialConfig = {},
    private legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null = null,
  ) {
    super();
    this.#config = new TwistyPlayerConfig(this, initialConfig);

    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }

  set alg(seq: Sequence) {
    // TODO: do validation for other algs as well.
    if (seq?.type !== "sequence") {
      // TODO: document `.setAttribute("alg", "R U R'")` as a workaround.
      throw new Error("Must set `alg` using a `Sequence`!");
    }
    this.#config.attributes["alg"].setValue(seq);
    this.cursor?.setAlg(seq); // TODO: can we ensure the cursor already exists?
  }

  get alg(): Sequence {
    return this.#config.attributes["alg"].value;
  }

  set puzzle(puzzle: PuzzleID) {
    if (this.#config.attributes["puzzle"].setValue(puzzle)) {
      this.setPuzzle(puzzle);
    }
  }

  get puzzle(): PuzzleID {
    return this.#config.attributes["puzzle"].value as PuzzleID;
  }

  set visualization(visualization: VisualizationFormat) {
    if (this.#config.attributes["visualization"].setValue(visualization)) {
      this.setPuzzle(this.puzzle);
    }
  }

  get visualization(): VisualizationFormat {
    return this.#config.attributes["visualization"]
      .value as VisualizationFormat;
  }

  set background(background: BackgroundTheme) {
    this.#config.attributes["background"].setValue(background);
    if (this.#viewerWrapper) {
      this.#viewerWrapper.checkered = background === "checkered";
    }
  }

  get background(): BackgroundTheme {
    return this.#config.attributes["background"].value as BackgroundTheme;
  }

  set controls(controls: ControlsLocation) {
    const oldControls = this.#config.attributes["controls"].value;
    if (this.#config.attributes["controls"].setValue(controls)) {
      this.contentWrapper.classList.remove(`controls-${oldControls}`);
      this.contentWrapper.classList.add(`controls-${controls}`);
    }
  }

  get controls(): ControlsLocation {
    return this.#config.attributes["controls"].value as ControlsLocation;
  }

  set backView(backView: BackViewLayout) {
    this.#config.attributes["back-view"].setValue(backView);
  }

  get backView(): BackViewLayout {
    return this.#config.attributes["back-view"].value as BackViewLayout;
  }

  set cameraPosition(cameraPosition: Vector3) {
    this.#config.attributes["camera-position"].setValue(cameraPosition);
    if (
      ["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)
    ) {
      (this.viewerElems[0] as Twisty3DCanvas)?.camera.position.copy(
        cameraPosition,
      );
      this.viewerElems[0]?.scheduleRender();
      // Back view may or may not exist.
      (this.viewerElems[1] as Twisty3DCanvas)?.camera.position
        .copy(cameraPosition)
        .multiplyScalar(-1);
      this.viewerElems[1]?.scheduleRender();
    }
  }

  get cameraPosition(): Vector3 {
    return this.#config.attributes["camera-position"].value;
  }

  static get observedAttributes(): string[] {
    return TwistyPlayerConfig.observedAttributes;
  }

  attributeChangedCallback(
    attributeName: string,
    oldValue: string,
    newValue: string,
  ): void {
    this.#config.attributeChangedCallback(attributeName, oldValue, newValue);
  }

  // TODO: It seems this called after the `attributeChangedCallback`s for initial values. Can we rely on this?
  protected connectedCallback(): void {
    this.timeline = new Timeline();

    const viewers = this.createViewers(
      this.timeline,
      this.alg,
      this.visualization,
      this.puzzle,
      this.backView !== "none",
    );
    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);

    this.viewerElems = viewers;
    this.controlElems = [scrubber, controlButtonGrid];

    // TODO: specify exactly when back views are possible.
    // TODO: Are there any SVGs where we'd want a separate back view?
    const setBackView: boolean = this.backView && this.visualization !== "2D";
    const backView: BackViewLayout = setBackView
      ? (this.backView as BackViewLayout)
      : "none";
    this.#viewerWrapper = new TwistyViewerWrapper({
      checkered: this.background === "checkered",
      backView,
    });
    this.addElement(this.#viewerWrapper);

    this.contentWrapper.classList.add(`controls-${this.controls}`);

    this.viewerElems.map((el) => this.#viewerWrapper.addElement(el));
    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);

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
          this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.cursor = new AlgCursor(
            timeline,
            Puzzles[puzzleName],
            new Sequence([]),
          );
        }
        this.timeline.addCursor(this.cursor);
        this.timeline.jumpToEnd();
        return [new Twisty2DSVG(this.cursor, Puzzles[puzzleName])];
      case "3D":
        if (puzzleName === "3x3x3") {
          // TODO: fold 3D and PG3D into this.
          try {
            this.cursor = new AlgCursor(timeline, Puzzles[puzzleName], alg);
          } catch (e) {
            // TODO: Deduplicate fallback.
            this.cursor = new AlgCursor(
              timeline,
              Puzzles[puzzleName],
              new Sequence([]),
            );
          }
          this.scene = new Twisty3DScene();
          const cube3d = new Cube3D(
            this.cursor,
            this.scene.scheduleRender.bind(this.scene),
          );
          this.scene.addTwisty3DPuzzle(cube3d);
          const mainViewer = new Twisty3DCanvas(this.scene);
          const viewers = [mainViewer];
          if (backView) {
            const partner = new Twisty3DCanvas(this.scene, {
              // cameraPosition, // TODO
              negateCameraPosition: true,
            });
            viewers.push(partner);
            mainViewer.setMirror(partner);
          }
          this.timeline.addCursor(this.cursor);
          this.timeline.jumpToEnd();
          return viewers;
        }
      // fallthrough for 3D when not 3x3x3
      case "PG3D": {
        const [kpuzzleDef, stickerDat, cameraPosition] = this.pgHelper(
          puzzleName,
        );

        try {
          this.cursor = new AlgCursor(timeline, kpuzzleDef, alg);
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.cursor = new AlgCursor(timeline, kpuzzleDef, new Sequence([]));
        }

        this.scene = new Twisty3DScene();
        const pg3d = new PG3D(
          this.cursor,
          this.scene.scheduleRender.bind(this.scene),
          kpuzzleDef,
          stickerDat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation ?? true,
        );
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        this.scene.addTwisty3DPuzzle(this.twisty3D);
        const mainView = new Twisty3DCanvas(this.scene, {
          cameraPosition,
        });
        const viewers = [mainView];
        if (backView) {
          const partner = new Twisty3DCanvas(this.scene, {
            cameraPosition,
            negateCameraPosition: true,
          });
          mainView.setMirror(partner);
          viewers.push(partner);
        }
        this.timeline.addCursor(this.cursor);
        this.timeline.jumpToEnd();
        return viewers;
      }
      default:
        throw new Error("fdsfkjsdlkfjsdklfjdslkf");
    }
  }

  // TODO: Distribute this code better.
  private pgHelper(
    puzzleName: string,
  ): [KPuzzleDefinition, StickerDat, Vector3 | undefined] {
    let kpuzzleDef: KPuzzleDefinition;
    let stickerDat: StickerDat;
    const cameraPosition: Vector3 | undefined = undefined;
    if (this.legacyExperimentalPG3DViewConfig) {
      kpuzzleDef = this.legacyExperimentalPG3DViewConfig.def;
      stickerDat = this.legacyExperimentalPG3DViewConfig.stickerDat;
      // experimentalPolarVantages ?: boolean;
      // sideBySide ?: boolean;
      // showFoundation ?: boolean;;
    } else {
      const pg = createPG(puzzleName);
      stickerDat = pg.get3d(0.0131);
      kpuzzleDef = pg.writekpuzzle();
    }
    return [kpuzzleDef, stickerDat, cameraPosition];
  }

  setPuzzle(
    puzzleName: string,
    legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig,
  ): void {
    this.puzzle = puzzleName as PuzzleID;
    this.legacyExperimentalPG3DViewConfig =
      legacyExperimentalPG3DViewConfig ?? null;
    switch (this.visualization) {
      // TODO: Swap out both 3D implementations with each other.
      case "PG3D": {
        console.log("pg3d");
        const scene = this.scene!;
        scene.remove(this.twisty3D!);
        this.cursor.removePositionListener(this.twisty3D!);
        const [def, dat /*, _*/] = this.pgHelper(this.puzzle);
        const pg3d = new PG3D(
          this.cursor,
          scene.scheduleRender.bind(scene),
          def,
          dat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation,
        );
        scene.addTwisty3DPuzzle(pg3d);
        this.cursor.setPuzzle(def);
        this.twisty3D = pg3d;
        this.legacyExperimentalPG3D = pg3d;
        for (const viewer of this.viewerElems) {
          viewer.scheduleRender();
        }
        return;
      }

      // this.#cursor.set
      // return;
    }

    // Fallback
    const oldCursor = this.cursor;
    const viewers = this.createViewers(
      this.timeline,
      this.alg,
      this.visualization,
      puzzleName,
      this.backView !== "none",
    );
    this.timeline.removeCursor(oldCursor);
    this.timeline.removeTimestampListener(oldCursor);
    for (const oldViewer of this.viewerElems) {
      this.#viewerWrapper.removeElement(oldViewer);
    }
    for (const viewer of viewers.reverse()) {
      this.#viewerWrapper.prependElement(viewer);
    }
    this.viewerElems = viewers;
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  experimentalAddMove(move: BlockMove, coalesce: boolean = false): void {
    const oldNumMoves = countMoves(this.alg); // TODO
    const newAlg = experimentalAppendBlockMove(
      this.alg,
      move,
      coalesce,
      this.legacyExperimentalCoalesceModFunc(move),
    );

    this.alg = newAlg;
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
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player", TwistyPlayer);
}
