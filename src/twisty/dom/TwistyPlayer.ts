import { Vector3 } from "three";
import { countMoves } from "../../../app/twizzle/move-counter";
import { BlockMove, experimentalAppendBlockMove, Sequence } from "../../alg";
import { parse } from "../../alg/parser/parser";
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
import { ClassListManager } from "./element/ClassListManager";
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import { customElementsShim } from "./element/node-custom-element-shims";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import {
  BackgroundTheme,
  centeredCameraPosition,
  ControlsLocation,
  cubeCameraPosition,
  ExperimentalStickering,
  HintFaceletStyle,
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

function is3DVisualization(visualizationFormat: VisualizationFormat): boolean {
  return ["3D", "PG3D"].includes(visualizationFormat);
}

// <twisty-player>
export class TwistyPlayer extends ManagedCustomElement {
  #config: TwistyPlayerConfig;

  timeline: Timeline;
  cursor: AlgCursor;
  scene: Twisty3DScene | null = null;
  twisty3D: Twisty3DPuzzle | null = null;

  viewerElems: TwistyViewerElement[] = []; // TODO: can we represent the intermediate state better?
  controlElems: TwistyControlElement[] = []; // TODO: can we represent the intermediate state better?

  #viewerWrapper: TwistyViewerWrapper;
  public legacyExperimentalCoalesceModFunc: (mv: BlockMove) => number = (
    _mv: BlockMove,
  ): number => 0;

  #controlsClassListManager: ClassListManager<
    ControlsLocation
  > = new ClassListManager(this, "controls-", ["none", "bottom-row"]);

  /** @deprecated */
  public legacyExperimentalPG3D: PG3D | null = null;
  /** @deprecated */
  private legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null;
  // TODO: support config from DOM.
  constructor(
    initialConfig: TwistyPlayerInitialConfig = {},
    legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null = null,
  ) {
    super();
    this.addCSS(twistyPlayerCSS);
    this.#config = new TwistyPlayerConfig(this, initialConfig);

    // We also do this in connectedCallback, but for now we also do it here so
    // that there is some visual change even if the rest of construction or
    // initialization fails.
    this.contentWrapper.classList.add("checkered");

    this.legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }

  set alg(seq: Sequence) {
    // TODO: do validation for other algs as well.
    if (seq?.type !== "sequence") {
      // TODO: document `.setAttribute("experimental-start-setup", "R U R'")` as a workaround.
      console.warn(
        "`alg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!",
      );
      seq = parse((seq as unknown) as string) as Sequence;
    }
    this.#config.attributes["alg"].setValue(seq);
    this.cursor?.setAlg(seq); // TODO: can we ensure the cursor already exists?
  }

  get alg(): Sequence {
    return this.#config.attributes["alg"].value;
  }

  set experimentalStartSetup(seq: Sequence) {
    // TODO: do validation for other algs as well.
    if (seq?.type !== "sequence") {
      // TODO: document `.setAttribute("experimental-start-setup", "R U R'")` as a workaround.
      console.warn(
        "`experimentalStartSetup` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!",
      );
      seq = parse((seq as unknown) as string) as Sequence;
    }
    this.#config.attributes["experimental-start-setup"].setValue(seq);
    if (this.cursor) {
      this.cursor.setStartState(this.cursor.algToState(seq)); // TODO
    }
  }

  get experimentalStartSetup(): Sequence {
    return this.#config.attributes["experimental-start-setup"].value;
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

  set hintFacelets(hintFacelets: HintFaceletStyle) {
    // TODO: implement this for PG3D.
    if (this.#config.attributes["hint-facelets"].setValue(hintFacelets)) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({ hintFacelets });
      }
    }
  }

  get hintFacelets(): HintFaceletStyle {
    return this.#config.attributes["hint-facelets"].value as HintFaceletStyle;
  }

  // TODO: Implement for PG3D
  /** @deprecated */
  get experimentalStickering(): ExperimentalStickering {
    return this.#config.attributes["experimental-stickering"]
      .value as ExperimentalStickering;
  }

  // TODO: Implement for PG3D
  /** @deprecated */
  set experimentalStickering(experimentalStickering: ExperimentalStickering) {
    if (
      this.#config.attributes["experimental-stickering"].setValue(
        experimentalStickering,
      )
    ) {
      if (this.twisty3D instanceof Cube3D) {
        this.twisty3D.experimentalUpdateOptions({
          experimentalStickering,
        });
      }
    }
  }

  set background(background: BackgroundTheme) {
    if (this.#config.attributes["background"].setValue(background)) {
      this.contentWrapper.classList.toggle(
        "checkered",
        background === "checkered",
      );
    }
  }

  get background(): BackgroundTheme {
    return this.#config.attributes["background"].value as BackgroundTheme;
  }

  set controls(controls: ControlsLocation) {
    this.#controlsClassListManager.setValue(controls);
  }

  get controls(): ControlsLocation {
    return this.#config.attributes["controls"].value as ControlsLocation;
  }

  set backView(backView: BackViewLayout) {
    if (backView !== "none" && this.viewerElems.length === 1) {
      this.createBackViewer();
    }
    if (backView === "none" && this.viewerElems.length > 1) {
      this.removeBackViewerElem();
    }
    if (this.#viewerWrapper && this.#viewerWrapper.setBackView(backView)) {
      for (const viewer of this.viewerElems as Twisty3DCanvas[]) {
        viewer.makeInvisibleUntilRender(); // TODO: can we do this more elegantly?
      }
    }
  }

  get backView(): BackViewLayout {
    return this.#config.attributes["back-view"].value as BackViewLayout;
  }

  set cameraPosition(cameraPosition: Vector3 | null) {
    this.#config.attributes["camera-position"].setValue(cameraPosition);
    if (
      this.viewerElems &&
      ["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)
    ) {
      (this.viewerElems[0] as Twisty3DCanvas)?.camera.position.copy(
        this.effectiveCameraPosition,
      );
      this.viewerElems[0]?.scheduleRender();
      // Back view may or may not exist.
      (this.viewerElems[1] as Twisty3DCanvas)?.camera.position
        .copy(this.effectiveCameraPosition)
        .multiplyScalar(-1);
      this.viewerElems[1]?.scheduleRender();
    }
  }

  get cameraPosition(): Vector3 | null {
    return this.#config.attributes["camera-position"].value;
  }

  get effectiveCameraPosition(): Vector3 {
    return this.cameraPosition ?? this.defaultCameraPosition;
  }

  // TODO
  get defaultCameraPosition(): Vector3 {
    return this.puzzle[1] === "x" ? cubeCameraPosition : centeredCameraPosition;
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

    this.contentWrapper.classList.toggle(
      "checkered",
      this.background === "checkered",
    );

    // TODO: specify exactly when back views are possible.
    // TODO: Are there any SVGs where we'd want a separate back view?
    const setBackView: boolean = this.backView && this.visualization !== "2D";
    const backView: BackViewLayout = setBackView
      ? (this.backView as BackViewLayout)
      : "none";
    this.#viewerWrapper = new TwistyViewerWrapper({
      backView,
    });
    this.addElement(this.#viewerWrapper);

    this.createViewers(
      this.timeline,
      this.alg,
      this.visualization,
      this.puzzle,
      this.backView !== "none",
    );
    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, this);

    this.controlElems = [scrubber, controlButtonGrid];

    this.#controlsClassListManager.setValue(this.controls);

    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);
  }

  protected createViewers(
    timeline: Timeline,
    alg: Sequence,
    visualization: VisualizationFormat,
    puzzleName: string,
    backView: boolean,
  ): void {
    switch (visualization) {
      case "2D": {
        try {
          this.cursor = new AlgCursor(
            timeline,
            Puzzles[puzzleName],
            alg,
            this.experimentalStartSetup,
          );
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.cursor = new AlgCursor(
            timeline,
            Puzzles[puzzleName],
            new Sequence([]),
            this.experimentalStartSetup,
          );
        }
        this.cursor.setStartState(
          this.cursor.algToState(this.experimentalStartSetup),
        );

        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          // TODO: find better way to configure when to start where (e.g. initialTimestamp: "start" | "end" | "setup")
          this.timeline.jumpToEnd();
        }
        const mainViewer = new Twisty2DSVG(this.cursor, Puzzles[puzzleName]);
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        return;
      }
      case "3D":
        if (puzzleName === "3x3x3") {
          // TODO: fold 3D and PG3D into this.
          try {
            this.cursor = new AlgCursor(
              timeline,
              Puzzles[puzzleName],
              alg,
              this.experimentalStartSetup,
            );
          } catch (e) {
            // TODO: Deduplicate fallback.
            this.cursor = new AlgCursor(
              timeline,
              Puzzles[puzzleName],
              new Sequence([]),
              this.experimentalStartSetup,
            );
          }
          this.cursor.setStartState(
            this.cursor.algToState(this.experimentalStartSetup),
          );
          this.scene = new Twisty3DScene();
          this.twisty3D = new Cube3D(
            this.cursor,
            this.scene.scheduleRender.bind(this.scene),
            {
              hintFacelets: this.hintFacelets,
              experimentalStickering: this.experimentalStickering,
            },
          );
          this.scene.addTwisty3DPuzzle(this.twisty3D);
          const mainViewer = new Twisty3DCanvas(this.scene, {
            cameraPosition: this.effectiveCameraPosition,
          });
          this.#viewerWrapper.addElement(mainViewer);
          this.viewerElems = [mainViewer];
          if (backView) {
            this.createBackViewer();
            // const partner = new Twisty3DCanvas(this.scene, {
            //   // cameraPosition, // TODO
            //   negateCameraPosition: true,
            // });
            // this.viewerElems.push(partner);
            // mainViewer.setMirror(partner);
          }
          this.timeline.addCursor(this.cursor);
          if (this.experimentalStartSetup.nestedUnits.length === 0) {
            // TODO: find better way to configure when to start where (e.g. initialTimestamp: "start" | "end" | "setup")
            this.timeline.jumpToEnd();
          }
          return;
        }
      // fallthrough for 3D when not 3x3x3
      case "PG3D": {
        const [kpuzzleDef, stickerDat] = this.pgHelper(puzzleName);

        try {
          this.cursor = new AlgCursor(
            timeline,
            kpuzzleDef,
            alg,
            this.experimentalStartSetup,
          );
        } catch (e) {
          // TODO: Deduplicate fallback.
          this.cursor = new AlgCursor(
            timeline,
            kpuzzleDef,
            new Sequence([]),
            this.experimentalStartSetup,
          );
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
        const mainViewer = new Twisty3DCanvas(this.scene, {
          cameraPosition: this.effectiveCameraPosition,
        });
        this.viewerElems = [mainViewer];
        this.#viewerWrapper.addElement(mainViewer);
        if (backView) {
          this.createBackViewer();
        }
        this.timeline.addCursor(this.cursor);
        if (this.experimentalStartSetup.nestedUnits.length === 0) {
          // TODO: find better way to configure when to start where (e.g. initialTimestamp: "start" | "end" | "setup")
          this.timeline.jumpToEnd();
        }
        return;
      }
      default:
        throw new Error("Unknown visualization");
    }
  }

  // TODO: Distribute this code better.
  private pgHelper(puzzleName: string): [KPuzzleDefinition, StickerDat] {
    let kpuzzleDef: KPuzzleDefinition;
    let stickerDat: StickerDat;
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
    return [kpuzzleDef, stickerDat];
  }

  private createBackViewer(): void {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }

    const backViewer = new Twisty3DCanvas(this.scene!, {
      cameraPosition: this.effectiveCameraPosition,
      negateCameraPosition: true,
    });
    this.viewerElems.push(backViewer);
    (this.viewerElems[0] as Twisty3DCanvas).setMirror(backViewer);
    this.#viewerWrapper.addElement(backViewer);
  }

  private removeBackViewerElem(): void {
    // TODO: Validate visualization.
    if (this.viewerElems.length !== 2) {
      throw new Error("Tried to remove non-existent back view!");
    }
    this.#viewerWrapper.removeElement(this.viewerElems.pop()!);
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
        const scene = this.scene!;
        scene.remove(this.twisty3D!);
        this.cursor.removePositionListener(this.twisty3D!);
        const [def, dat /*, _*/] = this.pgHelper(this.puzzle);
        this.cursor.setPuzzle(def, undefined, this.experimentalStartSetup);
        const pg3d = new PG3D(
          this.cursor,
          scene.scheduleRender.bind(scene),
          def,
          dat,
          this.legacyExperimentalPG3DViewConfig?.showFoundation,
        );
        scene.addTwisty3DPuzzle(pg3d);
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
    for (const oldViewer of this.viewerElems) {
      this.#viewerWrapper.removeElement(oldViewer);
    }
    this.createViewers(
      this.timeline,
      this.alg,
      this.visualization,
      puzzleName,
      this.backView !== "none",
    );
    this.timeline.removeCursor(oldCursor);
    this.timeline.removeTimestampListener(oldCursor);
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

customElementsShim.define("twisty-player", TwistyPlayer);
