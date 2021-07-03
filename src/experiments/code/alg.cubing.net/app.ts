import { KPuzzle } from "../../../cubing/kpuzzle";
import { Alg, AlgBuilder, LineComment, Newline } from "../../../cubing/alg";
import { puzzles } from "../../../cubing/puzzles";
import "../../../cubing/twisty"; // For `<twisty-alg-editor>` custom elem registration.
import type { TwistyAlgEditor } from "../../../cubing/twisty";
import {
  ExperimentalStickering,
  TwistyPlayer,
  TwistyPlayerInitialConfig,
} from "../../../cubing/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { APP_TITLE } from "./strings";
import { supportedPuzzles } from "./supported-puzzles";
import { getURLParam, setURLParams } from "./url-params";
import { cube3x3x3KPuzzle } from "../../../cubing/puzzles/implementations/3x3x3/3x3x3.kpuzzle.json_";
import {
  experimentalSolve2x2x2,
  experimentalSolve3x3x3IgnoringCenters,
  solveMegaminx,
  solvePyraminx,
  solveSkewb,
} from "../../../cubing/solve";
import { cube2x2x2KPuzzle } from "../../../cubing/puzzles/implementations/2x2x2/2x2x2.kpuzzle.json_";
import { randomScrambleForEvent } from "../../../cubing/scramble";

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

  private setSetupAnchor(setupAnchor: "start" | "end"): boolean {
    setURLParams({ "experimental-setup-anchor": setupAnchor });
    location.reload();
    return true;
  }

  private setStickering(stickering: ExperimentalStickering): boolean {
    setURLParams({ "experimental-stickering": stickering });
    location.reload();
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
    let scramble: Alg;
    switch (this.twistyPlayer.puzzle) {
      case "2x2x2": {
        scramble = await randomScrambleForEvent("222");
        break;
      }
      case "3x3x3": {
        scramble = await randomScrambleForEvent("333");
        break;
      }
      case "megaminx": {
        scramble = await randomScrambleForEvent("minx");
        break;
      }
      case "clock": {
        scramble = await randomScrambleForEvent("clock");
        break;
      }
      default:
        return;
    }
    this.controlPane.setAlg(
      algAppend(this.twistyPlayer.alg, " Scramble", scramble),
    );
  }
}

// TODO: Generate type from list.
type AlgElemStatusClass = "status-warning" | "status-bad";
const algElemStatusClasses: AlgElemStatusClass[] = [
  "status-warning",
  "status-bad",
];

class ControlPane {
  public experimentalSetupAlgInput: TwistyAlgEditor;
  public algInput: TwistyAlgEditor;
  public puzzleSelect: HTMLSelectElement;
  public setupAnchorSelect: HTMLSelectElement;
  public stickeringSelect: HTMLSelectElement;
  private solveButton: HTMLButtonElement;
  private scrambleButton: HTMLButtonElement;
  constructor(
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
    twistyPlayer: TwistyPlayer,
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

    this.experimentalSetupAlgInput.addEventListener(
      "input",
      this.onexperimentalSetupAlgInput.bind(this, false),
    );
    this.experimentalSetupAlgInput.addEventListener(
      "change",
      this.onexperimentalSetupAlgInput.bind(this, true),
    );

    this.solveButton = findOrCreateChildWithClass(
      this.element,
      "solve-button",
      "button",
    );
    this.solveButton.addEventListener("click", this.solve);

    this.scrambleButton = findOrCreateChildWithClass(
      this.element,
      "scramble-button",
      "button",
    );
    this.scrambleButton.addEventListener("click", this.scramble);

    this.onAlgInput(true);
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
    for (const puzzleName in supportedPuzzles) {
      const option = document.createElement("option");
      option.value = puzzleName;
      option.textContent = supportedPuzzles[puzzleName].displayName();
      this.puzzleSelect.appendChild(option);
      if (puzzleName === initialPuzzleName) {
        option.selected = true;
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

  setAlg(alg: Alg): void {
    this.algInput.algString = alg.toString();
    this.algChangeCallback(alg);
  }

  setPuzzle(puzzle: string): void {
    this.solveButton.disabled = ![
      "2x2x2",
      "3x3x3",
      "skewb",
      "pyraminx",
      "megaminx",
    ].includes(puzzle);
    this.scrambleButton.disabled = ![
      "2x2x2",
      "3x3x3",
      "megaminx",
      "clock",
    ].includes(puzzle);
  }
}
