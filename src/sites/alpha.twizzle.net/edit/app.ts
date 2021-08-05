import { KPuzzle } from "../../../cubing/kpuzzle";
import { Alg, AlgBuilder, LineComment, Newline } from "../../../cubing/alg";
import { puzzles } from "../../../cubing/puzzles";
import "../../../cubing/twisty"; // For `<twisty-alg-editor>` custom elem registration.
import type { Twisty3DCanvas, TwistyAlgEditor } from "../../../cubing/twisty";
import {
  ExperimentalStickering,
  TwistyPlayer,
  TwistyPlayerInitialConfig,
} from "../../../cubing/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { APP_TITLE } from "./strings";
import { puzzleGroups, supportedPuzzles } from "./supported-puzzles";
import { getURLParam, setURLParams } from "./url-params";
import { cube3x3x3KPuzzle } from "../../../cubing/puzzles/implementations/3x3x3/3x3x3.kpuzzle.json_";
import {
  experimentalSolve2x2x2,
  experimentalSolve3x3x3IgnoringCenters,
  solveMegaminx,
  solvePyraminx,
  solveSkewb,
} from "../../../cubing/search";
import { cube2x2x2KPuzzle } from "../../../cubing/puzzles/implementations/2x2x2/2x2x2.kpuzzle.json_";
import { randomScrambleForEvent } from "../../../cubing/scramble";
import { customElementsShim } from "../../../cubing/twisty/dom/element/node-custom-element-shims";
import { examples } from "./examples";
import { experimentalEnsureAlg } from "../../../cubing/alg/Alg";
import "../../../cubing/twisty/dom/stream/TwistyStreamSource";
import type { TwistyStreamSource } from "../../../cubing/twisty/dom/stream/TwistyStreamSource";
import type { PuzzleStreamMoveEventRegisterCompatible } from "../../../cubing/stream/process/ReorientedStream";
import type { PuzzleID } from "../../../cubing/twisty/dom/TwistyPlayerConfig";

export interface AppData {
  puzzleName: string;
  experimentalSetupAlg: Alg;
  experimentalSetupAnchor: "start" | "end";
  experimentalStickering: ExperimentalStickering;
  alg: Alg;
}

function algAppend(oldAlg: Alg, comment: string, newAlg: Alg): Alg {
  const newAlgBuilder = new AlgBuilder();
  newAlgBuilder.experimentalPushAlg(oldAlg);
  if (
    !oldAlg.experimentalIsEmpty() &&
    !Array.from(oldAlg.units()).slice(-1)[0].is(Newline)
  ) {
    newAlgBuilder.push(new Newline());
  }
  newAlgBuilder.push(new LineComment(comment));
  newAlgBuilder.push(new Newline());
  newAlgBuilder.experimentalPushAlg(newAlg);
  return newAlgBuilder.toAlg();
}

const SCRAMBLE_EVENTS: Partial<Record<PuzzleID, string>> = {
  "3x3x3": "333",
  "2x2x2": "222",
  "4x4x4": "444",
  "5x5x5": "555",
  "6x6x6": "666",
  "7x7x7": "777",
  "clock": "clock",
  "megaminx": "minx",
  "pyraminx": "pyram",
  "skewb": "skewb",
  "square1": "sq1",
};

export class App {
  public twistyPlayer: TwistyPlayer;
  private puzzlePane: HTMLElement;
  private cachedSetupAnchor: "start" | "end";
  private controlPane: ControlPane;
  constructor(public element: Element, initialData: AppData) {
    this.cachedSetupAnchor = initialData.experimentalSetupAnchor;

    this.puzzlePane = findOrCreateChild(
      this.element,
      "puzzle-pane",
      "puzzle-pane",
    );
    this.puzzlePane.classList.remove("loading");
    const spinner = this.puzzlePane.querySelector(".spinner");
    if (spinner) {
      this.puzzlePane.removeChild(spinner);
    }

    this.initializeTwisty(initialData);

    const controlPaneElem = findOrCreateChild(
      this.element,
      "control-pane",
      "control-pane",
    );
    controlPaneElem.classList.remove("loading");
    // tslint:disable-next-line: no-unused-expression
    this.controlPane = new ControlPane(
      this,
      controlPaneElem,
      initialData,
      this.setExperimentalSetupAlg.bind(this),
      this.setAlg.bind(this),
      this.setPuzzle.bind(this),
      this.setSetupAnchor.bind(this),
      this.setStickering.bind(this),
      this.solve.bind(this),
      this.scramble.bind(this),
      this.twistyPlayer,
    );

    this.controlPane.setPuzzle(initialData.puzzleName);
  }

  private initializeTwisty(initialData: AppData): void {
    const twistyConfig: TwistyPlayerInitialConfig = {
      alg: new Alg(),
      viewerLink: "none",
    };
    const displayablePuzzle = supportedPuzzles[initialData.puzzleName];
    twistyConfig.puzzle = displayablePuzzle.puzzleName() as any; // TODO
    twistyConfig.visualization = displayablePuzzle.viz;
    twistyConfig.experimentalSetupAnchor = initialData.experimentalSetupAnchor;
    twistyConfig.experimentalStickering = initialData.experimentalStickering;
    this.twistyPlayer = new TwistyPlayer(twistyConfig);
    if (getURLParam("debug-simultaneous")) {
      this.twistyPlayer.experimentalSetCursorIndexer("simultaneous");
    }
    this.setExperimentalSetupAlg(initialData.experimentalSetupAlg);
    this.setAlg(initialData.alg);
    this.puzzlePane.appendChild(this.twistyPlayer);
  }

  // Boolean indicates success (e.g. alg is valid).
  private setExperimentalSetupAlg(experimentalSetupAlg: Alg): boolean {
    try {
      this.twistyPlayer.experimentalSetupAlg = experimentalSetupAlg;
      this.twistyPlayer.timeline.jumpToStart();
      setURLParams({ "experimental-setup-alg": experimentalSetupAlg });
      return true;
    } catch (e) {
      this.twistyPlayer.experimentalSetupAlg = new Alg();
      return false;
    }
  }

  // Boolean indicates success (e.g. alg is valid).
  private setAlg(alg: Alg): boolean {
    try {
      this.twistyPlayer.alg = alg;
      if (this.cachedSetupAnchor === "start") {
        this.twistyPlayer.timeline.jumpToEnd();
      } else {
        this.twistyPlayer.timeline.jumpToStart();
      }
      setURLParams({ alg });
      return true;
    } catch (e) {
      this.twistyPlayer.alg = new Alg();
      return false;
    }
  }

  private setPuzzle(puzzleName: string): boolean {
    setURLParams({ puzzle: puzzleName });
    // TODO: Handle 2D/3D transitions
    // this.twistyPlayer.setPuzzle(puzzleName);
    location.reload();
    this.controlPane.setPuzzle(puzzleName);
    return true;
  }

  public setSetupAnchor(
    setupAnchor: "start" | "end",
    reload: boolean = true,
  ): boolean {
    setURLParams({ "experimental-setup-anchor": setupAnchor });
    if (reload) {
      location.reload();
    }
    return true;
  }

  public setStickering(
    stickering: ExperimentalStickering,
    reload: boolean = true,
  ): boolean {
    setURLParams({ "experimental-stickering": stickering });
    if (reload) {
      location.reload();
    }
    return true;
  }

  async solve(): Promise<void> {
    let solution: Alg;
    switch (this.twistyPlayer.puzzle) {
      case "2x2x2": {
        const kpuzzle = new KPuzzle(cube2x2x2KPuzzle);
        kpuzzle.applyAlg(this.twistyPlayer.alg);
        solution = await experimentalSolve2x2x2(kpuzzle.state);
        break;
      }
      case "3x3x3": {
        const kpuzzle = new KPuzzle(cube3x3x3KPuzzle);
        kpuzzle.applyAlg(this.twistyPlayer.alg);
        solution = await experimentalSolve3x3x3IgnoringCenters(kpuzzle.state);
        break;
      }
      case "skewb": {
        const kpuzzle = new KPuzzle(await puzzles.skewb.def());
        kpuzzle.applyAlg(this.twistyPlayer.alg);
        solution = await solveSkewb(kpuzzle.state);
        break;
      }
      case "pyraminx": {
        const kpuzzle = new KPuzzle(await puzzles.pyraminx.def());
        kpuzzle.applyAlg(this.twistyPlayer.alg);
        solution = await solvePyraminx(kpuzzle.state);
        break;
      }
      case "megaminx": {
        const kpuzzle = new KPuzzle(await puzzles.megaminx.def());
        kpuzzle.applyAlg(this.twistyPlayer.alg);
        solution = await solveMegaminx(kpuzzle.state);
        break;
      }
      default:
        return;
    }
    this.controlPane.setAlg(
      algAppend(this.twistyPlayer.alg, " Solution", solution),
    );
  }

  async scramble(): Promise<void> {
    const event = SCRAMBLE_EVENTS[this.twistyPlayer.puzzle];
    if (event) {
      this.controlPane.setAlg(
        algAppend(
          this.twistyPlayer.alg,
          " Scramble",
          await randomScrambleForEvent(event),
        ),
      );
    }
  }
}

// TODO: Generate type from list.
type AlgElemStatusClass = "status-warning" | "status-bad";
const algElemStatusClasses: AlgElemStatusClass[] = [
  "status-warning",
  "status-bad",
];

class ButtonGrid extends HTMLElement {
  constructor() {
    super();
    for (const button of Array.from(this.querySelectorAll("button"))) {
      button.addEventListener("click", this.onClick.bind(this));
    }
  }

  onClick(e: MouseEvent): void {
    this.dispatchEvent(
      new CustomEvent("action", {
        detail: { action: (e.target as HTMLButtonElement).id },
      }),
    );
  }

  setButtonEnabled(id: string, enabled: boolean): void {
    // TODO: better button binding
    (this.querySelector(`#${id}`)! as HTMLButtonElement).disabled = !enabled;
  }
}

customElementsShim.define("button-grid", ButtonGrid);

class ControlPane {
  public experimentalSetupAlgInput: TwistyAlgEditor;
  public algInput: TwistyAlgEditor;
  public puzzleSelect: HTMLSelectElement;
  public setupAnchorSelect: HTMLSelectElement;
  public stickeringSelect: HTMLSelectElement;
  public tempoInput: HTMLInputElement;
  public hintFaceletCheckbox: HTMLInputElement;
  public toolGrid: ButtonGrid;
  public examplesGrid: ButtonGrid;
  private tempoDisplay: HTMLSpanElement;
  private twistyStreamSource: TwistyStreamSource;
  constructor(
    private app: App,
    public element: Element,
    initialData: AppData,
    private experimentalSetupAlgChangeCallback: (alg: Alg) => boolean,
    private algChangeCallback: (alg: Alg) => boolean,
    private setPuzzleCallback: (puzzleName: string) => boolean,
    private setSetupAnchorCallback: (setupAnchor: string) => boolean,
    private setStickeringCallback: (
      stickering: ExperimentalStickering,
    ) => boolean,
    private solve: () => void,
    private scramble: () => void,
    private twistyPlayer: TwistyPlayer,
  ) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

    this.experimentalSetupAlgInput = findOrCreateChildWithClass(
      this.element,
      "experimental-setup-alg",
      "twisty-alg-editor",
    ) as TwistyAlgEditor;
    this.experimentalSetupAlgInput.twistyPlayer = twistyPlayer;
    this.experimentalSetupAlgInput.algString =
      initialData.experimentalSetupAlg.toString();
    this.setExperimentalSetupAlgElemStatus(null);

    this.algInput = findOrCreateChildWithClass(
      this.element,
      "alg",
      "twisty-alg-editor",
    ) as TwistyAlgEditor;
    this.algInput, { twistyPlayer };
    this.algInput.twistyPlayer = twistyPlayer;
    this.algInput.algString = initialData.alg.toString();
    this.setAlgElemStatus(null);

    this.puzzleSelect = findOrCreateChildWithClass(
      this.element,
      "puzzle",
      "select",
    );
    this.initializePuzzleSelect(initialData.puzzleName);

    this.setupAnchorSelect = findOrCreateChildWithClass(
      this.element,
      "setup-anchor",
      "select",
    );
    this.initializeSetupAnchorSelect(initialData.experimentalSetupAnchor);

    this.stickeringSelect = findOrCreateChildWithClass(
      this.element,
      "stickering",
      "select",
    );
    this.initializeStickeringSelect(
      initialData.experimentalStickering,
      initialData.puzzleName,
    );

    this.algInput.addEventListener("input", this.onAlgInput.bind(this, false));
    this.algInput.addEventListener("change", this.onAlgInput.bind(this, true));

    this.tempoInput = findOrCreateChildWithClass(
      this.element,
      "tempo",
      "input",
    );
    this.tempoDisplay = findOrCreateChildWithClass(
      this.element,
      "tempo-display",
      "span",
    );
    this.hintFaceletCheckbox = findOrCreateChildWithClass(
      this.element,
      "hint-facelets",
      "input",
    );
    this.tempoInput.addEventListener("input", this.onTempoInput.bind(this));
    this.hintFaceletCheckbox.addEventListener(
      "input",
      this.onHintFaceletInput.bind(this),
    );

    this.toolGrid = findOrCreateChildWithClass(
      this.element,
      "tool-grid",
      "button-grid",
    );
    this.toolGrid.addEventListener("action", this.onToolAction.bind(this));

    this.examplesGrid = findOrCreateChildWithClass(
      this.element,
      "examples-grid",
      "button-grid",
    );
    this.examplesGrid.addEventListener(
      "action",
      this.onExampleAction.bind(this),
    );

    this.experimentalSetupAlgInput.addEventListener(
      "input",
      this.onexperimentalSetupAlgInput.bind(this, false),
    );
    this.experimentalSetupAlgInput.addEventListener(
      "change",
      this.onexperimentalSetupAlgInput.bind(this, true),
    );

    this.onAlgInput(true);

    this.twistyStreamSource = app.element.querySelector(
      "twisty-stream-source",
    ) as TwistyStreamSource;
    this.twistyStreamSource.addEventListener("move", this.onMove.bind(this));
  }

  private onMove(e: PuzzleStreamMoveEventRegisterCompatible): void {
    const move = e.detail.move;
    let alg = this.twistyPlayer.alg;
    try {
      this.twistyPlayer.experimentalAddMove(move, true);
      alg = this.twistyPlayer.alg;
    } catch (e) {
      console.info("Ignoring move:", move.toString());
    }
    this.algInput.algString = alg.toString();
    setURLParams({ alg });
  }

  private onexperimentalSetupAlgInput(canonicalize: boolean): void {
    try {
      const experimentalSetupAlgString =
        this.experimentalSetupAlgInput.algString;
      const parsedexperimentalSetupAlg = Alg.fromString(
        experimentalSetupAlgString,
      );
      this.experimentalSetupAlgChangeCallback(parsedexperimentalSetupAlg);

      const restringifiedexperimentalSetupAlg =
        parsedexperimentalSetupAlg.toString();
      const experimentalSetupAlgIsCanonical =
        restringifiedexperimentalSetupAlg === experimentalSetupAlgString;

      if (canonicalize && !experimentalSetupAlgIsCanonical) {
        this.experimentalSetupAlgInput.algString =
          restringifiedexperimentalSetupAlg;
      }
      // Set status before passing to the `Twisty`.
      this.setExperimentalSetupAlgElemStatus(
        canonicalize || experimentalSetupAlgIsCanonical
          ? null
          : "status-warning",
      );

      // TODO: cache last alg to avoid unnecessary updates?
      // Or should that be in the `Twisty` layer?
      if (
        !this.experimentalSetupAlgChangeCallback(parsedexperimentalSetupAlg)
      ) {
        this.setExperimentalSetupAlgElemStatus("status-bad");
      }
    } catch (e) {
      this.setExperimentalSetupAlgElemStatus("status-bad");
    }
  }

  private onAlgInput(canonicalize: boolean): void {
    try {
      const algString = this.algInput.algString;
      const parsedAlg = Alg.fromString(algString);
      this.algChangeCallback(parsedAlg);

      const restringifiedAlg = parsedAlg.toString();
      const algIsCanonical = restringifiedAlg === algString;

      if (canonicalize && !algIsCanonical) {
        this.algInput.algString = restringifiedAlg;
      }
      // Set status before passing to the `Twisty`.
      this.setAlgElemStatus(
        canonicalize || algIsCanonical ? null : "status-warning",
      );

      // TODO: cache last alg to avoid unnecessary updates?
      // Or should that be in the `Twisty` layer?
      if (!this.algChangeCallback(parsedAlg)) {
        this.setAlgElemStatus("status-bad");
      }
    } catch (e) {
      this.setAlgElemStatus("status-bad");
    }
  }

  private onTempoInput(): void {
    const tempoScale = parseFloat(this.tempoInput.value);
    this.twistyPlayer.timeline.tempoScale = tempoScale;
    this.tempoDisplay.textContent = `${tempoScale}×`;
  }

  private onHintFaceletInput(): void {
    this.twistyPlayer.hintFacelets = this.hintFaceletCheckbox.checked
      ? "floating"
      : "none";
  }

  private onToolAction(e: CustomEvent<{ action: string }>): void {
    switch (e.detail.action) {
      case "expand":
        this.setAlg(this.twistyPlayer.alg.expand());
        break;
      case "simplify":
        this.setAlg(this.twistyPlayer.alg.simplify());
        break;
      case "clear":
        this.setAlg(new Alg());
        this.setExperimentalSetupAlg(new Alg());
        break;
      case "invert":
        this.setAlg(this.twistyPlayer.alg.invert());
        break;
      case "solve":
        this.solve();
        break;
      case "scramble":
        this.scramble();
        break;
      case "screenshot":
        this.screenshot();
        break;
      case "connect-input":
        this.connectInput();
        break;
      default:
        throw new Error(`Unknown tool action! ${e.detail.action}`);
    }
  }

  private screenshot(): void {
    const elem = this.app.twistyPlayer.viewerElems[0] as
      | Twisty3DCanvas
      | undefined;
    if (elem) {
      const url = elem.renderToDataURL({
        squareCrop: true,
        minWidth: 2048,
        minHeight: 2048,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `[${
        this.app.twistyPlayer.puzzle
      }] ${this.app.twistyPlayer.alg.toString()}.png`;
      a.click();
    }
  }

  private connectInput(): void {
    this.twistyStreamSource.style.setProperty("display", "inherit");
  }

  private onExampleAction(e: CustomEvent<{ action: string }>): void {
    const config = examples[e.detail.action];
    this.setAlg(experimentalEnsureAlg(config.alg!));
    this.setExperimentalSetupAlg(
      experimentalEnsureAlg(config.experimentalSetupAlg!),
    );
    // this.app.setSetupAnchor(config.experimentalSetupAnchor!, false);
    // this.app.setStickering(config.experimentalStickering!, false);
    // if (config.puzzle) {
    //   this.setPuzzle(config.puzzle);
    // }
  }

  // Set to `null` to clear.
  private setExperimentalSetupAlgElemStatus(
    latestStatusClass: AlgElemStatusClass | null,
  ): void {
    for (const statusClass of algElemStatusClasses) {
      if (statusClass === latestStatusClass) {
        this.experimentalSetupAlgInput.classList.add(statusClass);
      } else {
        this.experimentalSetupAlgInput.classList.remove(statusClass);
      }
    }
  }

  // Set to `null` to clear.
  private setAlgElemStatus(latestStatusClass: AlgElemStatusClass | null): void {
    for (const statusClass of algElemStatusClasses) {
      if (statusClass === latestStatusClass) {
        this.algInput.classList.add(statusClass);
      } else {
        this.algInput.classList.remove(statusClass);
      }
    }
  }

  private initializePuzzleSelect(initialPuzzleName: string): void {
    this.puzzleSelect.textContent = "";
    for (const [groupName, puzzles] of Object.entries(puzzleGroups)) {
      const optgroup = this.puzzleSelect.appendChild(
        document.createElement("optgroup"),
      );
      optgroup.label = groupName;
      for (const puzzleOptInfo of puzzles) {
        const option = document.createElement("option");
        option.value = puzzleOptInfo.name;
        option.textContent = `${puzzleOptInfo.symbol} ${supportedPuzzles[
          puzzleOptInfo.name
        ].displayName()}`;
        optgroup.appendChild(option);
        if (puzzleOptInfo.name === initialPuzzleName) {
          option.selected = true;
        }
      }
    }
    this.puzzleSelect.addEventListener(
      "change",
      this.puzzleSelectChanged.bind(this),
    );
  }

  private puzzleSelectChanged(): void {
    const option = this.puzzleSelect.selectedOptions[0];
    this.setPuzzleCallback(option.value);
  }

  private initializeSetupAnchorSelect(initialSetupAnchor: string): void {
    this.setupAnchorSelect.textContent = "";
    for (const setupAnchor of ["start", "end"]) {
      const option = document.createElement("option");
      option.value = setupAnchor;
      option.textContent = "anchored at " + setupAnchor; // TODO
      this.setupAnchorSelect.appendChild(option);
      if (setupAnchor === initialSetupAnchor) {
        option.selected = true;
      }
    }
    this.setupAnchorSelect.addEventListener(
      "change",
      this.setupAnchorSelectChanged.bind(this),
    );
  }

  private setupAnchorSelectChanged(): void {
    const option = this.setupAnchorSelect.selectedOptions[0];
    this.setSetupAnchorCallback(option.value);
  }

  private async initializeStickeringSelect(
    initialStickering: string,
    puzzleName: string,
  ): Promise<void> {
    let appearances: Partial<Record<ExperimentalStickering, { name?: string }>>;

    // TODO: Look
    const p = puzzles[puzzleName];
    if (p.stickerings) {
      appearances = {};
      for (const stickering of await p.stickerings()) {
        appearances[stickering] = {};
      }
    } else {
      appearances = { full: {} } as any;
      this.stickeringSelect.disabled = true;
    }

    this.stickeringSelect.textContent = "";
    for (const [appearanceName, appearance] of Object.entries(appearances)) {
      const option = document.createElement("option");
      option.value = appearanceName;
      option.textContent = appearance?.name ?? appearanceName;
      this.stickeringSelect.appendChild(option);
      if (appearanceName === initialStickering) {
        option.selected = true;
      }
    }
    this.stickeringSelect.addEventListener(
      "change",
      this.stickeringChanged.bind(this),
    );
  }

  private stickeringChanged(): void {
    const option = this.stickeringSelect.selectedOptions[0];
    this.setStickeringCallback(option.value as ExperimentalStickering);
  }

  setExperimentalSetupAlg(alg: Alg): void {
    this.experimentalSetupAlgInput.algString = alg.toString();
    this.experimentalSetupAlgChangeCallback(alg);
    setURLParams({ "experimental-setup-alg": alg });
  }

  setAlg(alg: Alg): void {
    this.algInput.algString = alg.toString();
    this.algChangeCallback(alg);
    setURLParams({ alg });
  }

  setPuzzle(puzzle: string): void {
    this.hintFaceletCheckbox.disabled = !["3x3x3"].includes(puzzle);
    this.toolGrid.setButtonEnabled(
      "solve",
      ["2x2x2", "3x3x3", "skewb", "pyraminx", "megaminx"].includes(puzzle),
    );
    this.toolGrid.setButtonEnabled(
      "scramble",
      Object.keys(SCRAMBLE_EVENTS).includes(puzzle),
    );
    this.toolGrid.setButtonEnabled(
      "screenshot",
      !["clock", "square1"].includes(puzzle),
    );
  }
}

const exclusiveExpandButtons: ExpandButton[] = [];

class ExpandButton extends HTMLElement {
  associatedElem: HTMLElement | null = null;
  expanded: boolean;
  expandIcon: HTMLAnchorElement;
  exclusive: boolean;
  connectedCallback() {
    const forID = this.getAttribute("for");
    this.associatedElem = forID ? document.getElementById(forID) : null;
    this.expandIcon = this.querySelector(".expand-icon")!;
    this.querySelector("a")!.addEventListener("click", this.onClick.bind(this));
    this.expanded = this.getAttribute("expanded") === "true";
    this.exclusive = this.getAttribute("exclusive") !== "false";
    if (this.exclusive) {
      exclusiveExpandButtons.push(this);
    }
  }

  onClick(e: MouseEvent) {
    e.preventDefault();
    this.toggle();
    if (this.exclusive) {
      if (this.expanded) {
        for (const expandButton of exclusiveExpandButtons) {
          if (expandButton !== this) {
            expandButton.toggle(false);
          }
        }
      }
    }
  }

  toggle(expand?: boolean): void {
    this.expanded = expand ?? !this.expanded;
    if (this.associatedElem) {
      this.associatedElem.hidden = !this.expanded;
    }
    this.expandIcon.textContent = this.exclusive
      ? this.expanded
        ? "▿"
        : "▹"
      : this.expanded
      ? "▾"
      : "▸";
  }
}

customElementsShim.define("expand-button", ExpandButton);
