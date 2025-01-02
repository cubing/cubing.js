import { Alg, AlgBuilder, LineComment, Newline } from "../../../cubing/alg";
import { experimentalEnsureAlg } from "../../../cubing/alg/Alg";
import { puzzles } from "../../../cubing/puzzles";
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
  TwistyPlayer,
  type ExperimentalStickering,
  type PuzzleID,
  type TwistyPlayerConfig,
} from "../../../cubing/twisty";
import {
  constructMoveCountDisplay,
  getStickeringGroup,
} from "../../../cubing/twisty/cubing-private";
import type { SetupToLocation } from "../../../cubing/twisty/model/props/puzzle/state/SetupAnchorProp";
import { FreshListenerManager } from "../../../cubing/twisty/model/props/TwistyProp";
import { customElementsShim } from "../../../cubing/twisty/views/node-custom-element-shims";
import "../../../cubing/twisty/views/stream/TwistyStreamSource";
import type { TwistyStreamSource } from "../../../cubing/twisty/views/stream/TwistyStreamSource";
import type { TwistyAlgEditor } from "../../../cubing/twisty/views/TwistyAlgEditor/TwistyAlgEditor";
import { URLParamUpdater } from "../../../cubing/twisty/views/twizzle/url-params";
import { computeAlgFeatures } from "./alg-features";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { examples } from "./examples";
import { APP_TITLE } from "./strings";
import { puzzleGroups, supportedPuzzles } from "./supported-puzzles";
// import { setURLParams } from "./url-params";

// TODO: introduce concepts in `cubing/twisty` for "this is a valid twisty-player value, but not for the current puzzle".
const UNSUPPORTED_STICKERING = "(unsupported stickering)";

function algAppend(oldAlg: Alg, comment: string, newAlg: Alg): Alg {
  const newAlgBuilder = new AlgBuilder();
  newAlgBuilder.experimentalPushAlg(oldAlg);
  if (
    !(
      oldAlg.experimentalIsEmpty() ||
      Array.from(oldAlg.childAlgNodes()).slice(-1)[0].is(Newline)
    )
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
  clock: "clock",
  megaminx: "minx",
  pyraminx: "pyram",
  skewb: "skewb",
  square1: "sq1",
  fto: "fto",
  master_tetraminx: "master_tetraminx",
  kilominx: "kilominx",
  redi_cube: "redi_cube",
  loopover: "loopover",
  baby_fto: "baby_fto",
};

export class App {
  public twistyPlayer: TwistyPlayer;
  private puzzlePane: HTMLElement;
  public controlPane: ControlPane;
  constructor(
    public element: Element,
    initialConfig: TwistyPlayerConfig,
  ) {
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

    this.twistyPlayer.experimentalModel.puzzleSetupAlg.addFreshListener(() =>
      this.#onSetupOrAlgChange(),
    );
    this.twistyPlayer.experimentalModel.puzzleAlg.addFreshListener(() =>
      this.#onSetupOrAlgChange(),
    );
    this.element
      .querySelector(".auto-notation-undo")!
      .addEventListener("click", () => {
        this.controlPane.puzzleSelect.value = this.#autoNotationPuzzleOld!;
        this.controlPane.puzzleSelectChanged();
        this.element.querySelector<HTMLSpanElement>(
          ".auto-notation-change-back",
        )!.hidden = true;
        this.element.querySelector<HTMLSpanElement>(
          ".auto-notation-change-redo",
        )!.hidden = false;
        this.#autofixEnabled = false;
      });
    this.element
      .querySelector(".auto-notation-redo")!
      .addEventListener("click", () => {
        this.controlPane.puzzleSelect.value = this.#autoNotationPuzzleNew!;
        this.controlPane.puzzleSelectChanged();
        this.element.querySelector<HTMLSpanElement>(
          ".auto-notation-change-back",
        )!.hidden = false;
        this.element.querySelector<HTMLSpanElement>(
          ".auto-notation-change-redo",
        )!.hidden = true;
        this.#autofixEnabled = true;
      });
  }

  #autoNotationPuzzleOld: PuzzleID | undefined;
  #autoNotationPuzzleNew: PuzzleID | undefined;
  #autofixEnabled: boolean = true;
  // TODO: factor this out into a class
  async #onSetupOrAlgChange() {
    (async () => {
      const [originalPuzzleID, puzzleAlgWithIssue, puzzleSetupAlgWithIssue] =
        await Promise.all([
          this.twistyPlayer.experimentalModel.puzzleID.get(),
          this.twistyPlayer.experimentalModel.puzzleAlg.get(),
          this.twistyPlayer.experimentalModel.puzzleSetupAlg.get(),
        ]);
      if (
        puzzleAlgWithIssue.issues.errors.length > 0 ||
        puzzleSetupAlgWithIssue.issues.errors.length > 0
      ) {
        const [algWithIssue, setupAlgWithIssue] = await Promise.all([
          this.twistyPlayer.experimentalModel.alg.get(),
          this.twistyPlayer.experimentalModel.setupAlg.get(),
        ]);
        for (const puzzleID of [
          "3x3x3",
          "square1",
          "clock",
          "megaminx",
        ] satisfies PuzzleID[]) {
          const puzzleLoader = puzzles[puzzleID];
          const kpuzzle = await puzzleLoader.kpuzzle();
          try {
            if (
              algWithIssue.issues.errors.length === 0 &&
              setupAlgWithIssue.issues.errors.length === 0 &&
              kpuzzle.defaultPattern().applyAlg(algWithIssue.alg) &&
              kpuzzle.defaultPattern().applyAlg(setupAlgWithIssue.alg) // TODO: This ignores e.g. bandaging
            ) {
              this.#autoNotationPuzzleOld = originalPuzzleID;
              this.#autoNotationPuzzleNew = puzzleID;

              if (this.#autofixEnabled) {
                for (const elem of this.element.querySelectorAll(
                  ".auto-notation-puzzle-old",
                )) {
                  elem.textContent = puzzles[originalPuzzleID].fullName;
                }
                for (const elem of this.element.querySelectorAll(
                  ".auto-notation-puzzle-new",
                )) {
                  elem.textContent = puzzleLoader.fullName;
                }

                this.element.querySelector<HTMLSpanElement>(
                  ".auto-notation",
                )!.hidden = false;
                this.element.querySelector<HTMLSpanElement>(
                  ".auto-notation-change-back",
                )!.hidden = false;
                this.element.querySelector<HTMLSpanElement>(
                  ".auto-notation-change-redo",
                )!.hidden = true;

                this.controlPane.puzzleSelect.value = puzzleID;
                this.controlPane.puzzleSelectChanged();
              } else {
                for (const elem of this.element.querySelectorAll(
                  ".auto-notation-puzzle-new-new",
                )) {
                  elem.textContent = puzzleLoader.fullName;
                }
              }
              return;
            }
          } catch {}
        }
      }
    })();
  }

  async solve(): Promise<void> {
    const [puzzleID, currentAlgWithIssues] = await Promise.all([
      this.twistyPlayer.experimentalModel.puzzleID.get(),
      this.twistyPlayer.experimentalModel.alg.get(),
    ]);
    const currentAlg = currentAlgWithIssues.alg;
    let solution: Alg;
    const kpuzzle = await puzzles[puzzleID].kpuzzle();
    console.log(kpuzzle);
    switch (puzzleID) {
      case "2x2x2": {
        solution = await experimentalSolve2x2x2(
          kpuzzle.algToTransformation(currentAlg).toKPattern(),
        );
        break;
      }
      case "3x3x3": {
        solution = await experimentalSolve3x3x3IgnoringCenters(
          kpuzzle.algToTransformation(currentAlg).toKPattern(),
        );
        break;
      }
      case "skewb": {
        solution = await solveSkewb(
          kpuzzle.algToTransformation(currentAlg).toKPattern(),
        );
        break;
      }
      case "pyraminx": {
        solution = await solvePyraminx(
          kpuzzle.algToTransformation(currentAlg).toKPattern(),
        );
        break;
      }
      case "megaminx": {
        solution = await solveMegaminx(
          kpuzzle.algToTransformation(currentAlg).toKPattern(),
        );
        break;
      }
      default:
        return;
    }
    this.twistyPlayer.alg = algAppend(currentAlg, " Solution", solution);
  }

  async scramble(): Promise<void> {
    const [puzzleID, currentAlgWithIssues] = await Promise.all([
      this.twistyPlayer.experimentalModel.puzzleID.get(),
      this.twistyPlayer.experimentalModel.alg.get(),
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
  public moveCountDisplay: HTMLElement;
  public puzzleSelect: HTMLSelectElement;
  public setupAnchorSelect: HTMLSelectElement;
  public stickeringSelect: HTMLSelectElement;
  public tempoInput: HTMLInputElement;
  public hintFaceletCheckbox: HTMLInputElement;
  public show2DCheckbox: HTMLInputElement;
  public toolGrid: ButtonGrid;
  public examplesGrid: ButtonGrid;
  private tempoDisplay: HTMLSpanElement;
  private caretNISSInfo: HTMLElement;
  private commutatorConjugateInfo: HTMLElement;
  private square1Info: HTMLElement;
  private twistyStreamSource: TwistyStreamSource;
  constructor(
    private app: App,
    private twistyPlayer: TwistyPlayer,
    public element: Element,
    private solve: () => void,
    private scramble: () => void,
  ) {
    const appTitleElem: HTMLAnchorElement = findOrCreateChildWithClass(
      this.element,
      "title",
    );
    appTitleElem.textContent = APP_TITLE;

    // TODO: validation?
    twistyPlayer.experimentalModel.puzzleID.addFreshListener(
      this.onPuzzle.bind(this),
    );
    twistyPlayer.experimentalModel.title.addFreshListener((title) => {
      appTitleElem.textContent = title ?? APP_TITLE;
    });
    twistyPlayer.experimentalModel.alg.addFreshListener(({ alg }) => {
      // TODO: also do this for the setup alg?
      const algFeatures = computeAlgFeatures(alg);
      this.caretNISSInfo.hidden = !algFeatures.caretNISS;
      this.commutatorConjugateInfo.hidden = !(
        algFeatures.commutator || algFeatures.conjugate
      );
      const which: string[] = [];
      if (algFeatures.commutator) {
        which.push("commutator");
      }
      if (algFeatures.conjugate) {
        which.push("conjugate");
      }
      this.commutatorConjugateInfo.querySelector("a")!.textContent =
        `${which.join(" and ")} notation`;
      this.square1Info.hidden = !algFeatures.square1;
    });
    twistyPlayer.experimentalModel.videoURL.addFreshListener((url) => {
      const a = document.querySelector(".video-url") as HTMLAnchorElement;
      const urlString = url?.toString();
      a.href = urlString ? urlString : "";
      a.textContent = urlString ? "🎥 Video" : "";
    });
    twistyPlayer.experimentalModel.competitionID.addFreshListener(
      (competitionID) => {
        const a = document.querySelector(
          ".competition-url",
        ) as HTMLAnchorElement;
        a.href = competitionID
          ? `https://www.worldcubeassociation.org/competitions/${competitionID}`
          : "";
        a.textContent = competitionID ? "🏆 Competition" : "";
      },
    );

    /*******/

    this.experimentalSetupAlgInput = findOrCreateChildWithClass(
      this.element,
      "experimental-setup-alg",
      "twisty-alg-editor",
    );
    this.experimentalSetupAlgInput.twistyPlayer = twistyPlayer;

    this.moveCountDisplay = findOrCreateChildWithClass(
      this.element,
      "move-count",
      "span",
    );
    constructMoveCountDisplay(
      this.twistyPlayer.experimentalModel,
      this.moveCountDisplay,
    );

    this.algInput = findOrCreateChildWithClass(
      this.element,
      "alg",
      "twisty-alg-editor",
    );
    this.algInput.twistyPlayer = twistyPlayer;

    this.puzzleSelect = findOrCreateChildWithClass(
      this.element,
      "puzzle",
      "select",
    );
    this.twistyPlayer.experimentalModel.puzzleID
      .get()
      .then((puzzleID) => this.initializePuzzleSelect(puzzleID));

    this.setupAnchorSelect = findOrCreateChildWithClass(
      this.element,
      "setup-anchor",
      "select",
    );
    this.twistyPlayer.experimentalModel.setupAnchor
      .get()
      .then((anchor) => this.initializeSetupAnchorSelect(anchor));

    this.stickeringSelect = findOrCreateChildWithClass(
      this.element,
      "stickering",
      "select",
    );
    const freshListenerManager = new FreshListenerManager();
    freshListenerManager.addMultiListener(
      [
        this.twistyPlayer.experimentalModel.twistySceneModel.stickeringRequest,
        this.twistyPlayer.experimentalModel.puzzleID,
      ],
      ([stickeringRequest, puzzleID]) =>
        this.updateStickeringSelect(stickeringRequest, puzzleID),
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
    this.caretNISSInfo = findOrCreateChildWithClass(
      this.element,
      "caret-niss-info",
      "p",
    );
    this.commutatorConjugateInfo = findOrCreateChildWithClass(
      this.element,
      "commutator-conjugate-info",
      "p",
    );
    this.square1Info = findOrCreateChildWithClass(
      this.element,
      "square1-info",
      "p",
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

    this.show2DCheckbox = findOrCreateChildWithClass(
      this.element,
      "show-2D",
      "input",
    );
    this.show2DCheckbox.addEventListener(
      "input",
      this.onShow2DInput.bind(this),
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
      this.twistyPlayer.experimentalAddMove(move, {
        cancel: true,
      }); // TODO
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

  private onShow2DInput(): void {
    console.log("this.show2DCheckbox", this.show2DCheckbox);
    this.twistyPlayer.visualization = this.show2DCheckbox.checked
      ? "2D"
      : "auto";
  }

  private async onToolAction(
    e: CustomEvent<{ action: string }>,
  ): Promise<void> {
    switch (e.detail.action) {
      case "expand": {
        this.twistyPlayer.alg = (
          await this.twistyPlayer.experimentalModel.alg.get()
        ).alg.expand();
        break;
      }
      case "simplify": {
        this.twistyPlayer.experimentalModel.alg.set(
          (async () => {
            const [algWithIssues, puzzleLoader] = await Promise.all([
              this.twistyPlayer.experimentalModel.alg.get(),
              this.twistyPlayer.experimentalModel.puzzleLoader.get(),
            ]);
            return algWithIssues.alg.experimentalSimplify({
              cancel: true,
              puzzleLoader,
            });
          })(),
        );
        break;
      }
      case "clear": {
        this.twistyPlayer.alg = new Alg();
        this.twistyPlayer.experimentalSetupAlg = new Alg();
        this.twistyPlayer.experimentalTitle = null;
        break;
      }
      case "invert": {
        this.twistyPlayer.alg = (
          await this.twistyPlayer.experimentalModel.alg.get()
        ).alg.invert();
        break;
      }
      case "solve": {
        this.solve();
        break;
      }
      case "scramble": {
        this.scramble();
        break;
      }
      case "screenshot": {
        this.screenshot();
        break;
      }
      case "connect-input": {
        this.connectInput();
        break;
      }
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
    this.twistyPlayer.experimentalTitle = config.experimentalTitle ?? null;
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
        option.textContent = `${supportedPuzzles[
          puzzleOptInfo.name
        ].displayName()} ${puzzleOptInfo.symbol}`;
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

  puzzleSelectChanged(): void {
    const option = this.puzzleSelect.selectedOptions[0];
    this.twistyPlayer.puzzle = option.value as PuzzleID;
  }

  private initializeSetupAnchorSelect(initialSetupAnchor: string): void {
    this.setupAnchorSelect.textContent = "";
    for (const setupAnchor of ["start", "end"]) {
      const option = document.createElement("option");
      option.value = setupAnchor;
      option.textContent = `anchored at ${setupAnchor}`; // TODO
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

  private async updateStickeringSelect(
    initialStickering: string | null,
    puzzleName: string,
  ): Promise<void> {
    initialStickering ??= "full";
    let stickerings: Partial<Record<ExperimentalStickering, { name?: string }>>;

    // TODO: Look
    const p = puzzles[puzzleName];
    if (p.stickerings) {
      stickerings = {};
      for (const stickering of await p.stickerings()) {
        stickerings[stickering] = {};
      }
    } else {
      stickerings = { full: {} } as any;
    }

    if (!(initialStickering in stickerings)) {
      // TODO
      (stickerings as any)[UNSUPPORTED_STICKERING] = {};
      initialStickering = UNSUPPORTED_STICKERING;
    }

    this.stickeringSelect.textContent = "";
    let currentOptGroup: HTMLOptGroupElement | null = null;
    for (const [stickeringName, stickeringMask] of Object.entries(
      stickerings,
    )) {
      const stickeringGroup =
        stickeringName === UNSUPPORTED_STICKERING
          ? "Unsupported"
          : getStickeringGroup(stickeringName, puzzleName as PuzzleID);
      if (!currentOptGroup || currentOptGroup.label !== stickeringGroup) {
        currentOptGroup = this.stickeringSelect.appendChild(
          document.createElement("optgroup"),
        );
        currentOptGroup.label = stickeringGroup;
      }
      const option = document.createElement("option");
      option.value = stickeringName;
      option.textContent = stickeringMask?.name ?? stickeringName;
      currentOptGroup.appendChild(option);
      if (stickeringName === initialStickering) {
        option.selected = true;
      }
    }
    this.stickeringSelect.addEventListener(
      "change",
      this.stickeringChanged.bind(this),
    );
  }

  private stickeringChanged(): void {
    this.twistyPlayer.experimentalStickering =
      this.stickeringSelect.selectedOptions[0].value;
  }

  onPuzzle(puzzle: PuzzleID): void {
    this.hintFaceletCheckbox.disabled = [
      "clock",
      "square1",
      "redi_cube",
      "loopover",
      "melindas2x2x2x2",
      "tri_quad",
      "loopover",
    ].includes(puzzle);
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
