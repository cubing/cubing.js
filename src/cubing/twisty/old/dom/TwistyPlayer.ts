import { Vector3 } from "three";
import { Alg, experimentalAppendMove, Move } from "../../../alg";
import type { KPuzzleDefinition, Transformation } from "../../../kpuzzle";
import { countMoves } from "../../../notation"; // TODO
import type { StickerDat } from "../../../puzzle-geometry";
import { puzzles } from "../../../puzzles";
import type { PuzzleLoader } from "../../../puzzles/PuzzleLoader";
import type { PuzzleAppearance } from "../../../puzzles/stickerings/appearance";
import { Cube3D } from "../../views/3D/puzzles/Cube3D";
import { PG3D, PG3DOptions } from "../../views/3D/puzzles/PG3D";
import type { Twisty3DPuzzle } from "../../views/3D/puzzles/Twisty3DPuzzle";
import { Twisty3DScene } from "../../views/3D/Twisty3DScene";
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
import { TwistyControlButtonPanel } from "./controls/buttons";
import type { TwistyControlElement } from "./controls/TwistyControlElement";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { ClassListManager } from "./element/ClassListManager";
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import { customElementsShim } from "./element/node-custom-element-shims";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import {
  BackgroundTheme,
  CameraLatitudeLimits,
  ControlsLocation,
  defaultCameraOrbitCoordinates,
  ExperimentalStickering,
  HintFaceletStyle,
  PuzzleID,
  pyraminxLookAt,
  SetupToLocation,
  TwistyPlayerConfig,
  TwistyPlayerInitialConfig,
  ViewerLinkPage,
  VisualizationFormat,
} from "./TwistyPlayerConfig";
import { Twisty2DSVG, Twisty2DSVGOptions } from "./viewers/Twisty2DSVG";
import { Twisty3DCanvas } from "./viewers/Twisty3DCanvas";
import type {
  OrbitCoordinates,
  TwistyOrbitControls,
} from "./viewers/TwistyOrbitControls";
import type { TwistyViewerElement } from "./viewers/TwistyViewerElement";
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
  hintStickerHeightScale?: number;
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

export class TwistyPlayerV1 extends ManagedCustomElement {
  #config: TwistyPlayerConfig;

  timeline: Timeline;
  cursor: AlgCursor | null;
  scene: Twisty3DScene | null = null;
  twisty3D: Twisty3DPuzzle | null = null;

  #connected = false;
  #legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null =
    null;

  /** @deprecated */
  public legacyExperimentalPG3D: PG3D | null = null;
  #experimentalStartStateOverride: Transformation | null = null;

  viewerElems: TwistyViewerElement[] = []; // TODO: can we represent the intermediate state better?
  controlElems: TwistyControlElement[] = []; // TODO: can we represent the intermediate state better?

  #hackyPendingFinalMoveCoalesce = false;

  #viewerWrapper: TwistyViewerWrapper;
  public legacyExperimentalCoalesceModFunc: (move: Move) => number = (
    _move: Move,
  ): number => 0;

  #controlsClassListManager: ClassListManager<ControlsLocation> =
    new ClassListManager(this, "controls-", ["none", "bottom-row"]);

  #experimentalInvalidInitialAlgCallback: (alg: Alg) => void;
  #initialized = false;

  // TODO: support config from DOM.
  constructor(
    initialConfig: TwistyPlayerInitialConfig = {},
    legacyExperimentalPG3DViewConfig: LegacyExperimentalPG3DViewConfig | null = null,
    experimentalInvalidInitialAlgCallback: (alg: Alg) => void = () => {
      // stub
    },
  ) {
    super();
    this.addCSS(twistyPlayerCSS);
    this.#config = new TwistyPlayerConfig(this, initialConfig);
    this.#experimentalInvalidInitialAlgCallback =
      experimentalInvalidInitialAlgCallback;

    this.timeline = new Timeline();
    this.timeline.addActionListener(this);

    // We also do this in connectedCallback, but for now we also do it here so
    // that there is some visual change even if the rest of construction or
    // initialization fails.
    this.contentWrapper.classList.add("checkered");

    this.#legacyExperimentalPG3DViewConfig = legacyExperimentalPG3DViewConfig;
  }

  set alg(newAlg: Alg | string) {
    // TODO: do validation for other algs as well.
    if (typeof newAlg === "string") {
      newAlg = Alg.fromString(newAlg);
    }
    this.#config.attributes["alg"].setValue(newAlg);
    this.cursor?.setAlg(newAlg, this.#indexerConstructor()); // TODO: can we ensure the cursor already exists?
    this.#setCursorStartState();

    this.dispatchEvent(
      new CustomEvent("experimental-alg-update", { detail: { alg: this.alg } }),
    );
  }

  get alg(): Alg {
    return this.#config.attributes["alg"].value;
  }

  /** @deprecated */
  set experimentalSetupAlg(newAlg: Alg | string) {
    // TODO: do validation for other algs as well.
    if (typeof newAlg === "string") {
      console.warn(
        "`experimentalSetupAlg` for a `TwistyPlayer` was set using a string. It should be set using a `Sequence`!",
      );
      newAlg = new Alg(newAlg as unknown as string);
    }
    this.#config.attributes["experimental-setup-alg"].setValue(newAlg);
    this.#setCursorStartState();
  }

  /** @deprecated */
  get experimentalSetupAlg(): Alg {
    return this.#config.attributes["experimental-setup-alg"].value;
  }

  #setCursorStartState(): void {
    if (this.cursor) {
      this.cursor.setStartState(
        this.#experimentalStartStateOverride ??
          this.cursor.algToState(this.#cursorStartAlg()),
      ); // TODO
    }
  }

  #cursorStartAlg(): Alg {
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
    this.#setCursorStartState();
  }

  /** @deprecated */
  get experimentalSetupAnchor(): SetupToLocation {
    return this.#config.attributes["experimental-setup-anchor"].value;
  }

  set puzzle(puzzle: PuzzleID) {
    if (this.#config.attributes["puzzle"].setValue(puzzle)) {
      this.updatePuzzleDOM();
    }
  }

  get puzzle(): PuzzleID {
    return this.#config.attributes["puzzle"].value;
  }

  set visualization(visualization: VisualizationFormat) {
    if (this.#config.attributes["visualization"].setValue(visualization)) {
      this.updatePuzzleDOM();
    }
  }

  get visualization(): VisualizationFormat {
    return this.#config.attributes["visualization"].value;
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
    return this.#config.attributes["hint-facelets"].value;
  }

  // TODO: Implement for PG3D
  /** @deprecated */
  set experimentalStickering(experimentalStickering: ExperimentalStickering) {
    if (
      this.#config.attributes["experimental-stickering"].setValue(
        experimentalStickering,
      )
    ) {
      const twisty3D = this.twisty3D;
      if (twisty3D instanceof Cube3D) {
        twisty3D.experimentalUpdateOptions({
          experimentalStickering,
        });
      }
      if (twisty3D instanceof PG3D) {
        (async () => {
          const appearance = await this.#getPG3DAppearance();
          twisty3D.experimentalSetAppearance(appearance!); // TODO
        })();
      }
      if (this.viewerElems[0] instanceof Twisty2DSVG) {
        this.viewerElems[0].experimentalSetStickering(
          this.experimentalStickering,
        );
      }
    }
  }

  // TODO: Implement for PG3D
  /** @deprecated */
  get experimentalStickering(): ExperimentalStickering {
    return this.#config.attributes["experimental-stickering"].value;
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
    return this.#config.attributes["background"].value;
  }

  set controlPanel(controlPanel: ControlsLocation) {
    this.#config.attributes["control-panel"].setValue(controlPanel);
    this.#controlsClassListManager.setValue(controlPanel);
  }

  get controlPanel(): ControlsLocation {
    return this.#config.attributes["control-panel"].value;
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
      this.#createBackViewer();
    }
    if (backView === "none" && this.viewerElems.length > 1) {
      this.#removeBackViewerElem();
    }
    if (this.#viewerWrapper && this.#viewerWrapper.setBackView(backView)) {
      for (const viewer of this.viewerElems as Twisty3DCanvas[]) {
        viewer.makeInvisibleUntilRender(); // TODO: can we do this more elegantly?
      }
    }
  }

  get backView(): BackViewLayout {
    return this.#config.attributes["back-view"].value;
  }

  #orbitControls(): TwistyOrbitControls | null {
    if (
      !["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)
    ) {
      return null;
    }
    return (this.viewerElems[0] as Twisty3DCanvas)?.orbitControls ?? null;
  }

  #backOrbitControls(): TwistyOrbitControls | null {
    if (
      !["3D", "PG3D"].includes(this.#config.attributes["visualization"].value)
    ) {
      return null;
    }
    return (this.viewerElems[1] as Twisty3DCanvas)?.orbitControls ?? null;
  }

  set experimentalCameraLatitude(latitude: number | null) {
    this.#config.attributes["experimental-camera-latitude"].setValue(latitude);
    const orbitControls = this.#orbitControls();
    if (orbitControls && latitude !== null) {
      orbitControls.latitude = latitude;
      this.viewerElems[0].scheduleRender();
      this.viewerElems[1]?.scheduleRender();
    }
  }

  get experimentalCameraLatitude(): number | null {
    if (
      this.#config.attributes["experimental-camera-latitude"].value !== null
    ) {
      return this.#config.attributes["experimental-camera-latitude"].value;
    }
    return this.#orbitControls()?.latitude ?? null;
  }

  set experimentalCameraLongitude(longitude: number | null) {
    this.#config.attributes["experimental-camera-longitude"].setValue(
      longitude,
    );
    const orbitControls = this.#orbitControls();
    if (orbitControls && longitude !== null) {
      orbitControls.longitude = longitude;
      this.viewerElems[0].scheduleRender();
      this.viewerElems[1]?.scheduleRender();
    }
  }

  get experimentalCameraLongitude(): number | null {
    if (
      this.#config.attributes["experimental-camera-longitude"].value !== null
    ) {
      return this.#config.attributes["experimental-camera-longitude"].value;
    }
    return this.#orbitControls()?.longitude ?? null;
  }

  set experimentalCameraLatitudeLimits(latitudeLimits: CameraLatitudeLimits) {
    this.#config.attributes["experimental-camera-latitude-limits"].setValue(
      latitudeLimits,
    );
    const orbitControls = this.#orbitControls();
    console.log({ orbitControls });
    if (orbitControls) {
      orbitControls.experimentalLatitudeLimits = latitudeLimits;
    }
    const backOrbitControls = this.#backOrbitControls(); // TODO: propagate through direct orbit controls as source of truth.
    if (backOrbitControls) {
      backOrbitControls.experimentalLatitudeLimits = latitudeLimits;
    }
  }

  get experimentalCameraLatitudeLimits(): CameraLatitudeLimits {
    // TODO: sync with orbit controls
    return this.#config.attributes["experimental-camera-latitude-limits"].value;
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

  /** @deprecated */
  experimentalSetCameraOrbitCoordinates(coords: OrbitCoordinates): void {
    this.experimentalCameraLatitude = coords.latitude;
    this.experimentalCameraLongitude = coords.longitude;
    const orbitControls = this.#orbitControls();
    if (orbitControls) {
      orbitControls.distance = coords.distance;
    }
  }

  /** @deprecated */
  experimentalDerivedCameraOrbitCoordinates(): OrbitCoordinates {
    const defaultCoordinatesForPuzzle = defaultCameraOrbitCoordinates(
      this.puzzle,
    );

    return {
      latitude:
        this.experimentalCameraLatitude ?? defaultCoordinatesForPuzzle.latitude,
      longitude:
        this.experimentalCameraLongitude ??
        defaultCoordinatesForPuzzle.longitude,
      distance: defaultCoordinatesForPuzzle.distance, // TODO
    };
  }

  #lookAt(): Vector3 {
    switch (this.puzzle) {
      case "pyraminx":
      case "master_tetraminx":
        return pyraminxLookAt;
      default:
        return new Vector3(0, 0, 0);
    }
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

  experimentalSetStartStateOverride(state: Transformation | null): void {
    this.#experimentalStartStateOverride = state;
    this.#setCursorStartState();
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
    this.cursor?.experimentalSetIndexer(this.#indexerConstructor());
  }

  #indexerConstructor(): IndexerConstructor {
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
    const backView: BackViewLayout = setBackView ? this.backView : "none";
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
    this.updatePuzzleDOM(true).then(() => {
      if (!this.#initialized) {
        this.#initialized = true;
        // TODO: warn if `initialized` listener is registered after initialized?
        this.dispatchEvent(new CustomEvent("initialized"));
      }
    });
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  public twizzleLink(): string {
    const url = new URL("https://alpha.twizzle.net/edit/");
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
  #clearRenderMode(): void {
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

  #setRenderMode2D(): void {
    if (this.#renderMode === "2D") {
      return;
    }
    this.#clearRenderMode();
    this.#renderMode = "2D";
  }

  #setTwisty2DSVG(twisty2DSVG: Twisty2DSVG): void {
    this.#setRenderMode2D();

    this.#viewerWrapper.clear();
    this.#viewerWrapper.addElement(twisty2DSVG);
    this.viewerElems.push(twisty2DSVG);
  }

  #setRenderMode3D(): void {
    if (this.#renderMode === "3D") {
      return;
    }
    this.#clearRenderMode();

    this.scene = new Twisty3DScene();
    const mainViewer = new Twisty3DCanvas(this.scene, {
      orbitCoordinates: this.experimentalDerivedCameraOrbitCoordinates(),
    });
    mainViewer.orbitControls.experimentalLatitudeLimits =
      this.experimentalCameraLatitudeLimits;
    this.viewerElems.push(mainViewer);
    this.#viewerWrapper.addElement(mainViewer);

    if (this.backView !== "none") {
      this.#createBackViewer();
    }
    this.#renderMode = "3D";
  }

  #setTwisty3D(twisty3D: Twisty3DPuzzle): void {
    if (this.twisty3D) {
      this.scene!.removeTwisty3DPuzzle(this.twisty3D);
      if (this.twisty3D instanceof PG3D) {
        this.twisty3D.dispose();
      }
      this.twisty3D = null;
    }
    this.twisty3D = twisty3D;
    this.scene!.addTwisty3DPuzzle(twisty3D);
    const orbitControls = this.#orbitControls();
    if (orbitControls) {
      orbitControls.lookAt(this.#lookAt());
    }
  }

  #setCursor(cursor: AlgCursor): void {
    const oldCursor = this.cursor;
    this.cursor = cursor;
    try {
      this.cursor.setAlg(this.alg, this.#indexerConstructor());
      this.#setCursorStartState();
    } catch (e) {
      this.cursor.setAlg(new Alg(), this.#indexerConstructor());
      this.cursor.setStartState(this.cursor.algToState(new Alg()));
      this.#experimentalInvalidInitialAlgCallback(this.alg);
    }
    this.#setCursorStartState();
    this.timeline.addCursor(cursor);
    if (oldCursor) {
      this.timeline.removeCursor(oldCursor);
      this.timeline.removeTimestampListener(oldCursor);
    }
    this.experimentalSetCursorIndexer(this.#cursorIndexerName);
  }

  async updatePuzzleDOM(initial = false): Promise<void> {
    if (!this.#connected) {
      return;
    }

    let puzzleLoader: PuzzleLoader;
    if (this.puzzle === "custom") {
      puzzleLoader = {
        id: "custom",
        fullName: "Custom (PG3D)",
        def: () => Promise.resolve(this.#legacyExperimentalPG3DViewConfig!.def),
        svg: () => {
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
        this.#cursorStartAlg(),
        this.#indexerConstructor(),
      ); // TODO: validate more directly if the alg is okay for the puzzle.
      this.#setCursor(cursor);
    } catch (e) {
      if (initial) {
        // TODO: also take into account setup alg.
        this.#experimentalInvalidInitialAlgCallback(this.alg);
      }
      cursor = new AlgCursor(
        this.timeline,
        def,
        new Alg(),
        new Alg(),
        this.#indexerConstructor(),
      );
      this.#setCursor(cursor);
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

          this.#setRenderMode2D();
          const svgPromiseFn =
            this.visualization === "2D"
              ? puzzleLoader.svg
              : puzzleLoader.llSVG ?? puzzleLoader.svg;
          const mainViewer = new Twisty2DSVG(
            cursor,
            def,
            await svgPromiseFn(),
            options,
            puzzleLoader,
          );
          if (!pendingPuzzleUpdate.cancelled) {
            this.#setTwisty2DSVG(mainViewer);
          }
        }
        break;
      case "3D":
      case "PG3D":
        {
          this.#setRenderMode3D();
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
              def = pg.writekpuzzle(true); // TODO
              stickerDat = pg.get3d();
            } else {
              throw "Unimplemented!";
            }
            const options: PG3DOptions = {};

            const heightMap: Record<string, number> = {
              megaminx: 1.5,
              pyraminx: 1.75,
            };
            const hintStickerHeightScale =
              this.#legacyExperimentalPG3DViewConfig?.hintStickerHeightScale ??
              heightMap[this.puzzle] ??
              1;
            const pg3d = new PG3D(
              cursor,
              scene.scheduleRender.bind(scene),
              def,
              stickerDat,
              this.#legacyExperimentalPG3DViewConfig?.showFoundation ?? true,
              this.#legacyExperimentalPG3DViewConfig?.hintStickers ??
                this.hintFacelets === "floating",
              hintStickerHeightScale,
              options,
            );
            (async () => {
              const appearance = await this.#getPG3DAppearance();
              if (appearance) {
                pg3d.experimentalSetAppearance(appearance);
              }
            })();
            this.legacyExperimentalPG3D = pg3d;
            twisty3D = pg3d;
          }
          this.#setTwisty3D(twisty3D);
        }
        break;
    }
  }

  async #getPG3DAppearance(): Promise<PuzzleAppearance | null> {
    const puzzleLoader = puzzles[this.puzzle];
    if (puzzleLoader?.appearance) {
      return puzzleLoader.appearance(this.experimentalStickering ?? "full");
    }
    return null;
  }

  #createBackViewer(): void {
    if (!is3DVisualization(this.visualization)) {
      throw new Error("Back viewer requires a 3D visualization");
    }

    const backViewer = new Twisty3DCanvas(this.scene!, {
      orbitCoordinates: this.experimentalDerivedCameraOrbitCoordinates(),
      negateCameraPosition: true,
    });
    backViewer.orbitControls.experimentalLatitudeLimits =
      this.experimentalCameraLatitudeLimits;
    this.viewerElems.push(backViewer);
    (this.viewerElems[0] as Twisty3DCanvas).setMirror(backViewer);
    this.#viewerWrapper.addElement(backViewer);
  }

  #removeBackViewerElem(): void {
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
    coalesce = false,
    coalesceDelayed = false,
  ): void {
    if (this.#hackyPendingFinalMoveCoalesce) {
      this.#hackyCoalescePending();
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
      this.#hackyCoalescePending();
      this.timeline.jumpToEnd();
    }
  }

  #hackyCoalescePending(): void {
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

customElementsShim.define("twisty-player-v1", TwistyPlayerV1);
