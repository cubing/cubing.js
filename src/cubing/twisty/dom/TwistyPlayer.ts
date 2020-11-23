import { Vector3 } from "three";
import { BlockMove, experimentalAppendBlockMove, Sequence } from "../../alg";
import { parseAlg } from "../../alg/parser";
import { KPuzzleDefinition } from "../../kpuzzle";
import type { PuzzleGeometry, StickerDat } from "../../puzzle-geometry";
import { puzzles } from "../../puzzles";
import { PuzzleManager } from "../../puzzles/PuzzleManager";
import { Cube3D } from "../3D/puzzles/Cube3D";
import { PG3D } from "../3D/puzzles/PG3D";
import { Twisty3DPuzzle } from "../3D/puzzles/Twisty3DPuzzle";
import { Twisty3DScene } from "../3D/Twisty3DScene";
import { AlgCursor } from "../animation/alg/AlgCursor";
import {
  Timeline,
  TimelineAction,
  TimelineActionEvent,
  TimestampLocationType,
} from "../animation/Timeline";
import { countMoves } from "../TODO-MOVE-ME/move-counter"; // TODO
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
  hintStickers?: boolean;
}

function createPG(_puzzleName: string): PuzzleGeometry {
  throw "createPG commented out";
  // const pg = getPuzzleGeometryByName(puzzleName, [
  //   "allmoves",
  //   "true",
  //   "orientcenters",
  //   "true",
  // ]);
  // return pg;
}

function is3DVisualization(visualizationFormat: VisualizationFormat): boolean {
  return ["3D", "PG3D"].includes(visualizationFormat);
}

interface PendingPuzzleUpdate {
  cancel: boolean;
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

  #hackyPendingFinalMoveCoalesce: boolean = false;

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

    this.timeline = new Timeline();
    this.timeline.addActionListener(this);

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
      seq = parseAlg((seq as unknown) as string) as Sequence;
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
      seq = parseAlg((seq as unknown) as string) as Sequence;
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
    this.#config.attributes["back-view"].setValue(backView);
    this.updatePuzzle(puzzles[this.puzzle]);
    // if (backView !== "none" && this.viewerElems.length === 1) {
    //   this.createBackViewer();
    // }
    // if (backView === "none" && this.viewerElems.length > 1) {
    //   this.removeBackViewerElem();
    // }
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
      (this.viewerElems[0] as Twisty3DCanvas)?.camera.lookAt(
        new Vector3(0, 0, 0),
      );
      this.viewerElems[0]?.scheduleRender();
      // Back view may or may not exist.
      (this.viewerElems[1] as Twisty3DCanvas)?.camera.position
        .copy(this.effectiveCameraPosition)
        .multiplyScalar(-1);
      (this.viewerElems[1] as Twisty3DCanvas)?.camera.lookAt(
        new Vector3(0, 0, 0),
      );
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

  pendingPuzzleUpdates: PendingPuzzleUpdate[] = [];
  private replaceCurrentPuzzle(
    pendingPuzzleUpdate: PendingPuzzleUpdate,
    cursor: AlgCursor,
    frontViewerElement: TwistyViewerElement,
    backViewerElement: TwistyViewerElement | null,
  ): void {
    if (pendingPuzzleUpdate.cancel) {
      console.log("canceled");
      return;
    }
    console.log("flooey", backViewerElement);

    this.viewerElems = [];
    this.#viewerWrapper.innerHTML = "";
    this.timeline.removeCursor(this.cursor);

    this.viewerElems.push(frontViewerElement);
    this.#viewerWrapper.addElement(frontViewerElement);
    if (backViewerElement) {
      this.viewerElems.push(backViewerElement);
      this.#viewerWrapper.addElement(backViewerElement);
    }
    cursor.setStartState(cursor.algToState(this.experimentalStartSetup));
    this.timeline.addCursor(cursor);
    this.cursor = cursor;
    if (this.experimentalStartSetup.nestedUnits.length === 0) {
      // TODO: find better way to configure when to start where (e.g. initialTimestamp: "start" | "end" | "setup")
      this.timeline.jumpToEnd();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  private async updatePuzzle(puzzle: PuzzleManager): Promise<void> {
    for (const pendingPuzzleUpdate of this.pendingPuzzleUpdates) {
      pendingPuzzleUpdate.cancel = true;
    }
    this.pendingPuzzleUpdates = [];
    const pendingPuzzleUpdate: PendingPuzzleUpdate = { cancel: false };
    this.pendingPuzzleUpdates.push(pendingPuzzleUpdate);

    const def: KPuzzleDefinition = await puzzle.def();

    let cursor: AlgCursor;
    try {
      cursor = new AlgCursor(
        this.timeline,
        def,
        this.alg,
        this.experimentalStartSetup,
      );
    } catch (e) {
      cursor = new AlgCursor(
        this.timeline,
        def,
        new Sequence([]),
        this.experimentalStartSetup,
      );
    }
    switch (this.visualization) {
      case "2D":
        {
          const mainViewer = new Twisty2DSVG(cursor, def, await puzzle.svg());

          this.replaceCurrentPuzzle(
            pendingPuzzleUpdate,
            cursor,
            mainViewer,
            null,
          );
        }
        break;
      case "3D":
      case "PG3D":
        {
          const scene = new Twisty3DScene();
          const mainViewer = new Twisty3DCanvas(scene, {
            cameraPosition: this.effectiveCameraPosition,
          });

          let backViewer: Twisty3DCanvas | null = null;
          if (this.backView !== "none") {
            backViewer = new Twisty3DCanvas(scene!, {
              cameraPosition: this.effectiveCameraPosition,
              negateCameraPosition: true,
            });
            mainViewer.setMirror(backViewer);
          }

          let twisty3D: Twisty3DPuzzle;
          if (this.visualization === "3D" && puzzle.id === "3x3x3") {
            twisty3D = await new Cube3D(
              def,
              cursor,
              scene.scheduleRender.bind(scene),
              {
                hintFacelets: this.hintFacelets,
                experimentalStickering: this.experimentalStickering,
              },
            );
          } else {
            let def: KPuzzleDefinition;
            let dat: StickerDat;
            const pgGetter = puzzle?.pg;
            if (pgGetter) {
              const pg = await pgGetter();
              def = pg.writekpuzzle();
              dat = pg.get3d();
            } else {
              [def, dat /*, _*/] = this.pgHelper(this.puzzle);
            }
            twisty3D = new PG3D(
              cursor,
              scene.scheduleRender.bind(scene),
              def,
              dat,
              this.legacyExperimentalPG3DViewConfig?.showFoundation ?? true,
              this.legacyExperimentalPG3DViewConfig?.hintStickers ?? true,
            );
          }
          scene.addTwisty3DPuzzle(twisty3D);
          this.twisty3D = twisty3D;

          this.replaceCurrentPuzzle(
            pendingPuzzleUpdate,
            cursor,
            mainViewer,
            backViewer,
          );
        }
        break;
    }
  }

  protected async createViewers(
    _timeline: Timeline,
    _alg: Sequence,
    _visualization: VisualizationFormat,
    puzzleName: string,
    _backView: boolean,
  ): Promise<void> {
    this.updatePuzzle(puzzles[puzzleName]);
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
      stickerDat = pg.get3d();
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

  async setPuzzle(
    puzzleName: string,
    legacyExperimentalPG3DViewConfig?: LegacyExperimentalPG3DViewConfig,
  ): Promise<void> {
    this.legacyExperimentalPG3DViewConfig =
      legacyExperimentalPG3DViewConfig || null;
    this.updatePuzzle(puzzles[puzzleName]);
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  // Note: setting `coalesce`
  experimentalAddMove(
    move: BlockMove,
    coalesce: boolean = false,
    coalesceDelayed: boolean = false,
  ): void {
    if (this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
    }
    const oldNumMoves = countMoves(this.alg); // TODO
    const newAlg = experimentalAppendBlockMove(
      this.alg,
      move,
      coalesce && !coalesceDelayed,
      this.legacyExperimentalCoalesceModFunc(move),
    );
    if (coalesce && coalesceDelayed) {
      this.#hackyPendingFinalMoveCoalesce = true;
    }

    this.alg = newAlg;
    // TODO
    if (oldNumMoves <= countMoves(newAlg)) {
      this.timeline.experimentalJumpToLastMove();
    } else {
      this.timeline.jumpToEnd();
    }
    this.timeline.play();
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    if (
      actionEvent.action === TimelineAction.Pausing &&
      actionEvent.locationType === TimestampLocationType.EndOfTimeline &&
      this.#hackyPendingFinalMoveCoalesce
    ) {
      this.hackyCoalescePending();
      this.timeline.jumpToEnd();
    }
  }

  private hackyCoalescePending(): void {
    const units = this.alg.nestedUnits;
    const length = units.length;
    const pending = this.#hackyPendingFinalMoveCoalesce;
    this.#hackyPendingFinalMoveCoalesce = false;
    if (pending && length > 1 && units[length - 1].type === "blockMove") {
      const finalMove = units[length - 1] as BlockMove;
      const newAlg = experimentalAppendBlockMove(
        new Sequence(units.slice(0, length - 1)),
        finalMove,
        true,
        this.legacyExperimentalCoalesceModFunc(finalMove),
      );
      this.alg = newAlg;
    }
  }

  fullscreen(): void {
    this.requestFullscreen();
  }
}

customElementsShim.define("twisty-player", TwistyPlayer);
