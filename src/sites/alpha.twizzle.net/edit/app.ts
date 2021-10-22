import { Alg, AlgBuilder, LineComment, Newline } from "../../../cubing/alg";
import { experimentalEnsureAlg } from "../../../cubing/alg/Alg";
import { KPuzzle } from "../../../cubing/kpuzzle";
import { puzzles } from "../../../cubing/puzzles";
import { experimentalCube3x3x3KPuzzle as cube3x3x3KPuzzle } from "../../../cubing/kpuzzle";
import { randomScrambleForEvent } from "../../../cubing/scramble";
import {
  experimentalSolve2x2x2,
  experimentalSolve3x3x3IgnoringCenters,
  solveMegaminx,
  solvePyraminx,
  solveSkewb,
} from "../../../cubing/search";
import type { PuzzleStreamMoveEventRegisterCompatible } from "../../../cubing/stream/process/ReorientedStream";
import "../../../cubing/twisty"; // For `<twisty-alg-editor>` custom elem registration.
import {
  ExperimentalStickering,
  TwistyPlayer,
  TwistyPlayerConfig,
} from "../../../cubing/twisty";
import { customElementsShim } from "../../../cubing/twisty/old/dom/element/node-custom-element-shims";
import "../../../cubing/twisty/old/dom/stream/TwistyStreamSource";
import type { TwistyStreamSource } from "../../../cubing/twisty/old/dom/stream/TwistyStreamSource";
import type {
  PuzzleID,
  SetupToLocation,
} from "../../../cubing/twisty/old/dom/TwistyPlayerConfig";
import type { TwistyAlgEditor } from "../../../cubing/twisty/views/TwistyAlgEditor/TwistyAlgEditor";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { examples } from "./examples";
import { APP_TITLE } from "./strings";
import { puzzleGroups, supportedPuzzles } from "./supported-puzzles";
import { URLParamUpdater } from "../core/url-params";
// import { setURLParams } from "./url-params";

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
  public controlPane: ControlPane;
  constructor(public element: Element, initialConfig: TwistyPlayerConfig) {
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

    this.initializeTwisty(initialConfig);

    const controlPaneElem = findOrCreateChild(
      this.element,
      "control-pane",
      "control-pane",
    );
    controlPaneElem.classList.remove("loading");
    // tslint:disable-next-line: no-unused-expression
    this.controlPane = new ControlPane(
      this,
      this.twistyPlayer,
      controlPaneElem,
      this.solve.bind(this),
      this.scramble.bind(this),
    );

    new URLParamUpdater(this.twistyPlayer.experimentalModel);
  }

  // TODO: avoid modifying `initialConfig`?
  private initializeTwisty(initialConfig: TwistyPlayerConfig): void {
    initialConfig.viewerLink = "none";
    this.twistyPlayer = new TwistyPlayer(initialConfig);
    this.puzzlePane.appendChild(this.twistyPlayer);
  }

  async solve(): Promise<void> {
    const [puzzleID, currentAlgWithIssues] = await Promise.all([
      this.twistyPlayer.experimentalModel.puzzleIDProp.get(),
      this.twistyPlayer.experimentalModel.algProp.get(),
    ]);
    const currentAlg = currentAlgWithIssues.alg;
    let solution: Alg;
    switch (puzzleID) {
      case "2x2x2": {
        const kpuzzle = new KPuzzle(await puzzles["2x2x2"].def());
        kpuzzle.applyAlg(currentAlg);
        solution = await experimentalSolve2x2x2(kpuzzle.state);
        break;
      }
      case "3x3x3": {
        const kpuzzle = new KPuzzle(cube3x3x3KPuzzle);
        kpuzzle.applyAlg(currentAlg);
        solution = await experimentalSolve3x3x3IgnoringCenters(kpuzzle.state);
        break;
      }
      case "skewb": {
        const kpuzzle = new KPuzzle(await puzzles.skewb.def());
        kpuzzle.applyAlg(currentAlg);
        solution = await solveSkewb(kpuzzle.state);
        break;
      }
      case "pyraminx": {
        const kpuzzle = new KPuzzle(await puzzles.pyraminx.def());
        kpuzzle.applyAlg(currentAlg);
        solution = await solvePyraminx(kpuzzle.state);
        break;
      }
      case "megaminx": {
        const kpuzzle = new KPuzzle(await puzzles.megaminx.def());
        kpuzzle.applyAlg(currentAlg);
        solution = await solveMegaminx(kpuzzle.state);
        break;
      }
      default:
        return;
    }
    this.twistyPlayer.alg = algAppend(currentAlg, " Solution", solution);
  }

  async scramble(): Promise<void> {
    const [puzzleID, currentAlgWithIssues] = await Promise.all([
      this.twistyPlayer.experimentalModel.puzzleIDProp.get(),
      this.twistyPlayer.experimentalModel.algProp.get(),
    ]);
    const event = SCRAMBLE_EVENTS[puzzleID];
    if (event) {
      this.twistyPlayer.alg = algAppend(
        currentAlgWithIssues.alg,
        " Scramble",
        await randomScrambleForEvent(event),
      );
    }
  }
}

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
    (this.querySelector(`#${id}`) as HTMLButtonElement).disabled = !enabled;
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
    private twistyPlayer: TwistyPlayer,
    public element: Element,
    private solve: () => void,
    private scramble: () => void,
  ) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

    // TODO: validation?
    twistyPlayer.experimentalModel.puzzleIDProp.addFreshListener(
      this.onPuzzle.bind(this),
    );

    /*******/

    this.experimentalSetupAlgInput = findOrCreateChildWithClass(
      this.element,
      "experimental-setup-alg",
      "twisty-alg-editor",
    );
    this.experimentalSetupAlgInput.twistyPlayer = twistyPlayer;

    this.algInput = findOrCreateChildWithClass(
      this.element,
      "alg",
      "twisty-alg-editor",
    );
    this.algInput, { twistyPlayer };
    this.algInput.twistyPlayer = twistyPlayer;

    this.puzzleSelect = findOrCreateChildWithClass(
      this.element,
      "puzzle",
      "select",
    );
    this.twistyPlayer.experimentalModel.puzzleIDProp
      .get()
      .then((puzzleID) => this.initializePuzzleSelect(puzzleID));

    this.setupAnchorSelect = findOrCreateChildWithClass(
      this.element,
      "setup-anchor",
      "select",
    );
    this.twistyPlayer.experimentalModel.setupAnchorProp
      .get()
      .then((anchor) => this.initializeSetupAnchorSelect(anchor));

    this.stickeringSelect = findOrCreateChildWithClass(
      this.element,
      "stickering",
      "select",
    );
    Promise.all([
      this.twistyPlayer.experimentalModel.stickeringProp.get(),
      this.twistyPlayer.experimentalModel.puzzleIDProp.get(),
    ]).then(([stickering, puzzleID]) =>
      this.initializeStickeringSelect(stickering, puzzleID),
    );

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

    this.twistyStreamSource = app.element.querySelector(
      "twisty-stream-source",
    ) as TwistyStreamSource;
    this.twistyStreamSource.addEventListener("move", this.onMove.bind(this));
  }

  private async onMove(
    e: PuzzleStreamMoveEventRegisterCompatible,
  ): Promise<void> {
    const move = e.detail.move;
    try {
      this.twistyPlayer.experimentalAddMove(move); // TODO
    } catch (e) {
      console.info("Ignoring move:", move.toString());
    }
    // setURLParams({ alg });
  }

  private onTempoInput(): void {
    const tempoScale = parseFloat(this.tempoInput.value);
    this.twistyPlayer.tempoScale = tempoScale;
    this.tempoDisplay.textContent = `${tempoScale}×`;
  }

  private onHintFaceletInput(): void {
    this.twistyPlayer.hintFacelets = this.hintFaceletCheckbox.checked
      ? "floating"
      : "none";
  }

  private async onToolAction(
    e: CustomEvent<{ action: string }>,
  ): Promise<void> {
    switch (e.detail.action) {
      case "expand":
        this.twistyPlayer.alg = (
          await this.twistyPlayer.experimentalModel.algProp.get()
        ).alg.expand();
        break;
      case "simplify":
        this.twistyPlayer.alg = (
          await this.twistyPlayer.experimentalModel.algProp.get()
        ).alg.simplify();
        break;
      case "clear":
        this.twistyPlayer.alg = new Alg();
        this.twistyPlayer.experimentalSetupAlg = new Alg();
        break;
      case "invert":
        this.twistyPlayer.alg = (
          await this.twistyPlayer.experimentalModel.algProp.get()
        ).alg.invert();
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
    this.app.twistyPlayer.experimentalDownloadScreenshot();
  }

  private connectInput(): void {
    this.twistyStreamSource.style.setProperty("display", "inherit");
  }

  private onExampleAction(e: CustomEvent<{ action: string }>): void {
    const config = examples[e.detail.action];
    this.twistyPlayer.alg = experimentalEnsureAlg(config.alg!);
    this.twistyPlayer.experimentalSetupAlg = experimentalEnsureAlg(
      config.experimentalSetupAlg!,
    );
    // this.app.setSetupAnchor(config.experimentalSetupAnchor!, false);
    // this.app.setStickering(config.experimentalStickering!, false);
    // if (config.puzzle) {
    //   this.setPuzzle(config.puzzle);
    // }
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
    this.twistyPlayer.puzzle = option.value as PuzzleID;
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
    this.twistyPlayer.experimentalSetupAnchor = option.value as SetupToLocation;
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
    this.twistyPlayer.experimentalStickering = this.stickeringSelect
      .selectedOptions[0].value as ExperimentalStickering;
  }

  onPuzzle(puzzle: PuzzleID): void {
    this.hintFaceletCheckbox.disabled = ["clock", "square1"].includes(puzzle);
    this.toolGrid.setButtonEnabled(
      "solve",
      ["2x2x2", "3x3x3", "skewb", "pyraminx", "megaminx"].includes(puzzle),
    );
    this.toolGrid.setButtonEnabled(
      "scramble",
      Object.keys(SCRAMBLE_EVENTS).includes(puzzle),
    );
    // this.toolGrid.setButtonEnabled(
    //   "screenshot",
    //   !["clock", "square1"].includes(puzzle),
    // );
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
