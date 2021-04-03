import { Vector3 } from "three";
import { Alg, Move } from "../../alg";
import { experimentalAppendMove } from "../../alg/operation";
import { KPuzzleDefinition, Transformation } from "../../kpuzzle";
import type { StickerDat } from "../../puzzle-geometry";
import { puzzles } from "../../puzzles";
import { PuzzleLoader } from "../../puzzles/PuzzleLoader";
import { PuzzleAppearance } from "../3D/puzzles/appearance";
import { Cube3D } from "../3D/puzzles/Cube3D";
import { PG3D, PG3DOptions } from "../3D/puzzles/PG3D";
import { appearances4x4x4, appearancesFTO } from "../3D/puzzles/stickerings";
import { Twisty3DPuzzle } from "../3D/puzzles/Twisty3DPuzzle";
import { Twisty3DScene } from "../3D/Twisty3DScene";
import { AlgCursor, IndexerConstructor } from "../animation/cursor/AlgCursor";
import { SimpleAlgIndexer } from "../animation/indexer/SimpleAlgIndexer";
import { SimultaneousMoveIndexer } from "../animation/indexer/simultaneous-moves/SimultaneousMoveIndexer";
import { TreeAlgIndexer } from "../animation/indexer/tree/TreeAlgIndexer";
import {
  Timeline,
  TimelineAction,
  TimelineActionEvent,
  TimestampLocationType,
} from "../animation/Timeline";
import { countMoves } from "../../notation"; // TODO
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
  SetupToLocation,
  TwistyPlayerConfig,
  TwistyPlayerInitialConfig,
  ViewerLinkPage,
  VisualizationFormat,
} from "./TwistyPlayerConfig";
import { Twisty2DSVG, Twisty2DSVGOptions } from "./viewers/Twisty2DSVG";
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

function is3DVisualization(visualizationFormat: VisualizationFormat): boolean {
  return ["3D", "PG3D"].includes(visualizationFormat);
}

interface PendingPuzzleUpdate {
  cancelled: boolean;
}

const indexerMap = {
  simple: SimpleAlgIndexer,
  tree: TreeAlgIndexer,
  simultaneous: SimultaneousMoveIndexer,
};

// <twisty-player>
export class TwistyPlayer extends ManagedCustomElement {
  #config: TwistyPlayerConfig;

  timeline: Timeline;
  cursor: AlgCursor | null;
  scene: Twisty3DScene | null = null;
  twisty3D: Twisty3DPuzzle | null = null;

  #connected: boolean = false;
  #legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null = null;
  /** @deprecated */
  public legacyExperimentalPG3D: PG3D | null = null;
  #experimentalStartStateOverride: Transformation | null = null;

  viewerElems: TwistyViewerElement[] = []; // TODO: can we represent the intermediate state better?
  controlElems: TwistyControlElement[] = []; // TODO: can we represent the intermediate state better?

  #hackyPendingFinalMoveCoalesce: boolean = false;

  #viewerWrapper: TwistyViewerWrapper;
  public legacyExperimentalCoalesceModFunc: (move: Move) => number = (
    _move: Move,
  ): number => 0;

  #controlsClassListManager: ClassListManager<ControlsLocation> = new ClassListManager(
    this,
    "controls-",
    ["none", "bottom-row"],
  );

  // TODO: support config from DOM.
  constructor(
    initialConfig: TwistyPlayerInitialConfig = {},
    legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null = null,
    private experimentalInvalidInitialAlgCallback: (alg: Alg) => void = () => {
      // stub
    },
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

    this.#legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }

  set alg(newAlg: Alg) {
    // TODO: do validation for other algs as well.
    if (typeof newAlg === "string") {
      console.warn(
        "`alg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!",
      );
      newAlg = new Alg((newAlg as unknown) as string);
    }
    this.#config.attributes["alg"].setValue(newAlg);
    this.cursor?.setAlg(newAlg, this.indexerConstructor()); // TODO: can we ensure the cursor already exists?
    this.setCursorStartState();
  }

  get alg(): Alg {
    return this.#config.attributes["alg"].value;
  }

  /** @deprecated */
  set experimentalSetupAlg(newAlg: Alg) {
    // TODO: do validation for other algs as well.
    if (typeof newAlg === "string") {
      console.warn(
        "`experimentalSetupAlg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!",
      );
      newAlg = new Alg((newAlg as unknown) as string);
    }
    this.#config.attributes["experimental-setup-alg"].setValue(newAlg);
    this.setCursorStartState();
  }

  /** @deprecated */
  get experimentalSetupAlg(): Alg {
    return this.#config.attributes["experimental-setup-alg"].value;
  }

  private setCursorStartState(): void {
    if (this.cursor) {
      this.cursor.setStartState(
        this.#experimentalStartStateOverride ??
          this.cursor.algToState(this.cursorStartAlg()),
      ); // TODO
    }
  }

  private cursorStartAlg(): Alg {
    let startAlg = this.experimentalSetupAlg;
    if (this.experimentalSetupAnchor === "end") {
      startAlg = startAlg.concat(this.alg.invert());
    }
    return startAlg; // TODO
  }

  /** @deprecated */
  set experimentalSetupAnchor(setupToLocation: SetupToLocation) {
    this.#config.attributes["experimental-setup-anchor"].setValue(
      setupToLocation,
    );
    this.setCursorStartState();
  }

  /** @deprecated */
  get experimentalSetupAnchor(): SetupToLocation {
    return this.#config.attributes["experimental-setup-anchor"]
      .value as SetupToLocation;
  }

  set puzzle(puzzle: PuzzleID) {
    if (this.#config.attributes["puzzle"].setValue(puzzle)) {
      this.updatePuzzleDOM();
    }
  }

  get puzzle(): PuzzleID {
    return this.#config.attributes["puzzle"].value as PuzzleID;
  }

  set visualization(visualization: VisualizationFormat) {
    if (this.#config.attributes["visualization"].setValue(visualization)) {
      this.updatePuzzleDOM();
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
      if (this.twisty3D instanceof PG3D) {
        this.twisty3D.experimentalSetAppearance(this.getPG3DAppearance()!); // TODO
      }
      if (this.viewerElems[0] instanceof Twisty2DSVG) {
        (this.viewerElems[0] as Twisty2DSVG).experimentalSetStickering(
          this.experimentalStickering,
        );
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

  set controlPanel(controlPanel: ControlsLocation) {
    this.#config.attributes["control-panel"].setValue(controlPanel);
    this.#controlsClassListManager.setValue(controlPanel);
  }

  get controlPanel(): ControlsLocation {
    return this.#config.attributes["control-panel"].value as ControlsLocation;
  }

  /** @deprecated use `controlPanel */
  set controls(controls: ControlsLocation) {
    this.controlPanel = controls;
  }

  /** @deprecated use `controlPanel */
  get controls(): ControlsLocation {
    return this.controlPanel;
  }

  set backView(backView: BackViewLayout) {
    this.#config.attributes["back-view"].setValue(backView);
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

  set experimentalCameraPosition(cameraPosition: Vector3 | null) {
    console.log("experimentalCameraPosition");
    this.#config.attributes["experimental-camera-position"].setValue(
      cameraPosition,
    );
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

  get experimentalCameraPosition(): Vector3 | null {
    return this.#config.attributes["experimental-camera-position"].value;
  }

  set viewerLink(viewerLinkPage: ViewerLinkPage) {
    this.#config.attributes["viewer-link"].setValue(viewerLinkPage);
    const maybePanel = this.controlElems[1] as
      | TwistyControlButtonPanel
      | undefined;
    if (maybePanel?.setViewerLink) {
      maybePanel.setViewerLink(viewerLinkPage);
    }
  }

  get viewerLink(): ViewerLinkPage {
    return this.#config.attributes["viewer-link"].value;
  }

  get effectiveCameraPosition(): Vector3 {
    return this.experimentalCameraPosition ?? this.defaultCameraPosition;
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

  experimentalSetStartStateOverride(state: Transformation): void {
    this.#experimentalStartStateOverride = state;
    this.setCursorStartState();
  }

  #cursorIndexerName: "simple" | "tree" | "simultaneous" = "tree";
  /** @deprecated */
  public experimentalSetCursorIndexer(
    cursorName: "simple" | "tree" | "simultaneous",
  ): void {
    if (this.#cursorIndexerName === cursorName) {
      // TODO: This is a hacky optimization.
      return;
    }
    this.#cursorIndexerName = cursorName;
    this.cursor?.experimentalSetIndexer(this.indexerConstructor());
  }

  private indexerConstructor(): IndexerConstructor {
    return indexerMap[this.#cursorIndexerName];
  }

  // TODO: It seems this called after the `attributeChangedCallback`s for initial values. Can we rely on this?
  protected connectedCallback(): void {
    this.contentWrapper.classList.toggle(
      "checkered",
      this.background === "checkered",
    );

    // TODO: specify exactly when back views are possible.
    // TODO: Are there any SVGs where we'd want a separate back view?
    const setBackView: boolean =
      this.backView && is3DVisualization(this.visualization);
    const backView: BackViewLayout = setBackView
      ? (this.backView as BackViewLayout)
      : "none";
    this.#viewerWrapper = new TwistyViewerWrapper({
      backView,
    });
    this.addElement(this.#viewerWrapper);

    const scrubber = new TwistyScrubber(this.timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(this.timeline, {
      fullscreenElement: this,
      viewerLinkCallback: this.visitTwizzleLink.bind(this),
      viewerLink: this.viewerLink,
    });

    this.controlElems = [scrubber, controlButtonGrid];

    this.#controlsClassListManager.setValue(this.controlPanel);

    this.addElement(this.controlElems[0]);
    this.addElement(this.controlElems[1]);

    this.#connected = true;
    this.updatePuzzleDOM(true);
  }

  public twizzleLink(): string {
    const url = new URL(
      "https://experiments.cubing.net/cubing.js/alg.cubing.net/index.html",
    );
    // const url = new URL("http://localhost:3333/alg.cubing.net/index.html");
    if (!this.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", this.alg.toString());
    }
    if (!this.experimentalSetupAlg.experimentalIsEmpty()) {
      url.searchParams.set(
        "experimental-setup-alg",
        this.experimentalSetupAlg.toString(),
      );
    }
    if (this.experimentalSetupAnchor !== "start") {
      url.searchParams.set(
        "experimental-setup-anchor",
        this.experimentalSetupAnchor,
      );
    }
    if (this.experimentalStickering !== "full") {
      url.searchParams.set(
        "experimental-stickering",
        this.experimentalStickering,
      );
    }
    if (this.puzzle !== "3x3x3") {
      url.searchParams.set("puzzle", this.puzzle);
    }
    return url.toString();
  }

  public visitTwizzleLink(): void {
    const a = document.createElement("a");
    a.href = this.twizzleLink();
    a.target = "_blank";
    a.click();
  }

  #pendingPuzzleUpdates: PendingPuzzleUpdate[] = [];
  #renderMode: "2D" | "3D" | null = null;

  // Idempotent
  private clearRenderMode(): void {
    switch (this.#renderMode) {
      case "3D":
        this.scene = null;
        this.twisty3D = null;
        this.legacyExperimentalPG3D = null;
        this.viewerElems = [];
        this.#viewerWrapper.clear();
        break;
      case "2D":
        this.viewerElems = [];
        this.#viewerWrapper.clear();
        break;
    }
    this.#renderMode = null;
  }

  private setRenderMode2D(): void {
    if (this.#renderMode === "2D") {
      return;
    }
    this.clearRenderMode();
    this.#renderMode = "2D";
  }

  private setTwisty2DSVG(twisty2DSVG: Twisty2DSVG): void {
    this.setRenderMode2D();

    this.#viewerWrapper.clear();
    this.#viewerWrapper.addElement(twisty2DSVG);
    this.viewerElems.push(twisty2DSVG);
  }

  private setRenderMode3D(): void {
    if (this.#renderMode === "3D") {
      return;
    }
    this.clearRenderMode();

    this.scene = new Twisty3DScene();
    const mainViewer = new Twisty3DCanvas(this.scene, {
      experimentalCameraPosition: this.effectiveCameraPosition,
    });
    this.viewerElems.push(mainViewer);
    this.#viewerWrapper.addElement(mainViewer);

    if (this.backView !== "none") {
      this.createBackViewer();
    }
    this.#renderMode = "3D";
  }

  private setTwisty3D(twisty3D: Twisty3DPuzzle): void {
    if (this.twisty3D) {
      this.scene!.removeTwisty3DPuzzle(this.twisty3D);
      if (this.twisty3D instanceof PG3D) {
        this.twisty3D.dispose();
      }
      this.twisty3D = null;
    }
    this.twisty3D = twisty3D;
    this.scene!.addTwisty3DPuzzle(twisty3D);
  }

  private setCursor(cursor: AlgCursor): void {
    const oldCursor = this.cursor;
    this.cursor = cursor;
    try {
      this.cursor.setAlg(this.alg, this.indexerConstructor());
      this.setCursorStartState();
    } catch (e) {
      this.cursor.setAlg(new Alg(), this.indexerConstructor());
      this.cursor.setStartState(this.cursor.algToState(new Alg()));
      this.experimentalInvalidInitialAlgCallback(this.alg);
    }
    this.setCursorStartState();
    this.timeline.addCursor(cursor);
    if (oldCursor) {
      this.timeline.removeCursor(oldCursor);
      this.timeline.removeTimestampListener(oldCursor);
    }
    this.experimentalSetCursorIndexer(this.#cursorIndexerName);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  async updatePuzzleDOM(initial: boolean = false): Promise<void> {
    if (!this.#connected) {
      return;
    }

    let puzzleLoader: PuzzleLoader;
    if (this.puzzle === "custom") {
      puzzleLoader = {
        id: "custom",
        fullName: "Custom (PG3D)",
        def: () => Promise.resolve(this.#legacyExperimentalPG3DViewConfig!.def),
        svg: async () => {
          throw "unimplemented";
        },
      };
    } else {
      puzzleLoader = puzzles[this.puzzle];
    }

    for (const pendingPuzzleUpdate of this.#pendingPuzzleUpdates) {
      pendingPuzzleUpdate.cancelled = true;
    }
    this.#pendingPuzzleUpdates = [];
    const pendingPuzzleUpdate: PendingPuzzleUpdate = { cancelled: false };
    this.#pendingPuzzleUpdates.push(pendingPuzzleUpdate);

    const def: KPuzzleDefinition = await puzzleLoader.def();
    if (pendingPuzzleUpdate.cancelled) {
      return;
    }

    let cursor: AlgCursor;
    try {
      cursor = new AlgCursor(
        this.timeline,
        def,
        this.alg,
        this.cursorStartAlg(),
        this.indexerConstructor(),
      ); // TODO: validate more directly if the alg is okay for the puzzle.
      this.setCursor(cursor);
    } catch (e) {
      if (initial) {
        // TODO: also take into account setup alg.
        this.experimentalInvalidInitialAlgCallback(this.alg);
      }
      console.log("fallback;;");
      cursor = new AlgCursor(
        this.timeline,
        def,
        new Alg(),
        new Alg(),
        this.indexerConstructor(),
      );
      console.log("fallbacko;;");
      this.setCursor(cursor);
    }
    if (
      initial &&
      this.experimentalSetupAlg.experimentalIsEmpty() &&
      this.experimentalSetupAnchor !== "end"
    ) {
      this.timeline.jumpToEnd();
    }
    switch (this.visualization) {
      case "2D":
      case "experimental-2D-LL":
        {
          const options: Twisty2DSVGOptions = {};
          if (this.experimentalStickering) {
            options.experimentalStickering = this.experimentalStickering;
          }

          this.setRenderMode2D();
          const svgPromiseFn =
            this.visualization === "2D"
              ? puzzleLoader.svg
              : puzzleLoader.llSVG ?? puzzleLoader.svg;
          const mainViewer = new Twisty2DSVG(
            cursor,
            def,
            await svgPromiseFn(),
            options,
          );
          if (!pendingPuzzleUpdate.cancelled) {
            this.setTwisty2DSVG(mainViewer);
          }
        }
        break;
      case "3D":
      case "PG3D":
        {
          this.setRenderMode3D();
          const scene = this.scene!;

          let twisty3D: Twisty3DPuzzle;
          if (this.visualization === "3D" && this.puzzle === "3x3x3") {
            twisty3D = new Cube3D(
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
            let stickerDat: StickerDat;
            const pgGetter = puzzleLoader.pg;
            if (this.puzzle === "custom") {
              def = this.#legacyExperimentalPG3DViewConfig!.def;
              stickerDat = this.#legacyExperimentalPG3DViewConfig!.stickerDat;
            } else if (pgGetter) {
              const pg = await pgGetter();
              if (pendingPuzzleUpdate.cancelled) {
                return;
              }
              def = pg.writekpuzzle(true) as KPuzzleDefinition; // TODO
              stickerDat = pg.get3d();
            } else {
              throw "Unimplemented!";
            }
            const options: PG3DOptions = {};
            const appearance = this.getPG3DAppearance();
            if (appearance) {
              options.appearance = appearance;
            }
            const pg3d = new PG3D(
              cursor,
              scene.scheduleRender.bind(scene),
              def,
              stickerDat,
              this.#legacyExperimentalPG3DViewConfig?.showFoundation ?? true,
              this.#legacyExperimentalPG3DViewConfig?.hintStickers ??
                this.hintFacelets === "floating",
              options,
            );
            this.legacyExperimentalPG3D = pg3d;
            twisty3D = pg3d;
          }
          this.setTwisty3D(twisty3D);
        }
        break;
    }
  }

  private getPG3DAppearance(): PuzzleAppearance | null {
    if (this.puzzle === "4x4x4") {
      return (
        appearances4x4x4[this.experimentalStickering ?? "full"] ??
        appearances4x4x4["full"]
      );
    } else if (this.puzzle === "fto") {
      return (
        appearancesFTO[this.experimentalStickering ?? "full"] ??
        appearancesFTO["full"]
      );
    }
    return null;
  }

  private createBackViewer(): void {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }

    const backViewer = new Twisty3DCanvas(this.scene!, {
      experimentalCameraPosition: this.effectiveCameraPosition,
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

  async setCustomPuzzleGeometry(
    legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig,
  ): Promise<void> {
    this.puzzle = "custom";
    this.#legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
    await this.updatePuzzleDOM();
  }

  // TODO: Handle playing the new move vs. just modying the alg.
  // Note: setting `coalesce`
  experimentalAddMove(
    move: Move,
    coalesce: boolean = false,
    coalesceDelayed: boolean = false,
  ): void {
    if (this.#hackyPendingFinalMoveCoalesce) {
      this.hackyCoalescePending();
    }
    const oldNumMoves = countMoves(this.alg); // TODO
    const newAlg = experimentalAppendMove(this.alg, move, {
      coalesce: coalesce && !coalesceDelayed,
      mod: this.legacyExperimentalCoalesceModFunc(move),
    });
    // const newAlg = experimentalAppendBlockMove(
    //   this.alg,
    //   move,
    //   coalesce && !coalesceDelayed,
    //   this.legacyExperimentalCoalesceModFunc(move),
    // );
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
    const units = Array.from(this.alg.units());
    const length = units.length;
    const pending = this.#hackyPendingFinalMoveCoalesce;
    this.#hackyPendingFinalMoveCoalesce = false;
    if (pending && length > 1 && units[length - 1].is(Move)) {
      const finalMove = units[length - 1] as Move;
      const newAlg = experimentalAppendMove(
        new Alg(units.slice(0, length - 1)),
        finalMove,
        {
          coalesce: true,
          mod: this.legacyExperimentalCoalesceModFunc(finalMove),
        },
      );
      this.alg = newAlg;
    }
  }

  fullscreen(): void {
    this.requestFullscreen();
  }
}

customElementsShim.define("twisty-player", TwistyPlayer);
