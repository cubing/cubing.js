import { algToString, parseAlg, Sequence } from "../../cubing/alg";
import { TwistyPlayer, TwistyPlayerInitialConfig } from "../../cubing/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { puzzles } from "./supported-puzzles";
import {
  ALG_INPUT_PLACEHOLDER,
  ALG_SETUP_INPUT_PLACEHOLDER,
  APP_TITLE,
} from "./strings";
import { getURLParam, setURLParams } from "./url-params";
import { Vector3 } from "three";

export interface AppData {
  puzzleName: string;
  setupAlg: Sequence;
  alg: Sequence;
}

export class App {
  public twistyPlayer: TwistyPlayer;
  private puzzlePane: HTMLElement;
  constructor(public element: Element, initialData: AppData) {
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
    new ControlPane(
      controlPaneElem,
      initialData,
      this.setSetupAlg.bind(this),
      this.setAlg.bind(this),
      this.setPuzzle.bind(this),
    );
  }

  private initializeTwisty(initialData: AppData): void {
    const twistyConfig: TwistyPlayerInitialConfig = {
      alg: new Sequence([]),
      viewerLink: "none",
    };
    if (initialData.puzzleName === "megaminx") {
      twistyConfig.cameraPosition = new Vector3(0, 3.09, 5);
    }
    const displayablePuzzle = puzzles[initialData.puzzleName];
    console.log(initialData.puzzleName, displayablePuzzle);
    twistyConfig.puzzle = displayablePuzzle.puzzleName() as any; // TODO
    twistyConfig.visualization = displayablePuzzle.viz;
    this.twistyPlayer = new TwistyPlayer(twistyConfig);
    if (getURLParam("debug-simultaneous")) {
      this.twistyPlayer.experimentalSetCursorIndexer("simultaneous");
    }
    this.setSetupAlg(initialData.setupAlg);
    this.setAlg(initialData.alg);
    this.puzzlePane.appendChild(this.twistyPlayer);
  }

  // Boolean indicates success (e.g. alg is valid).
  private setSetupAlg(setupAlg: Sequence): boolean {
    console.log({ setupAlg });
    try {
      this.twistyPlayer.setupAlg = setupAlg;
      this.twistyPlayer.timeline.jumpToStart();
      setURLParams({ "setup-alg": setupAlg });
      return true;
    } catch (e) {
      this.twistyPlayer.setupAlg = parseAlg("");
      return false;
    }
  }

  // Boolean indicates success (e.g. alg is valid).
  private setAlg(alg: Sequence): boolean {
    try {
      this.twistyPlayer.alg = alg;
      this.twistyPlayer.timeline.jumpToEnd();
      setURLParams({ alg });
      return true;
    } catch (e) {
      this.twistyPlayer.alg = parseAlg("");
      return false;
    }
  }

  private setPuzzle(puzzleName: string): boolean {
    setURLParams({ puzzle: puzzleName });
    // TODO: Handle 2D/3D transitions
    // this.twistyPlayer.setPuzzle(puzzleName);
    location.reload();
    return true;
  }
}

// TODO: Generate type from list.
type AlgElemStatusClass = "status-warning" | "status-bad";
const algElemStatusClasses: AlgElemStatusClass[] = [
  "status-warning",
  "status-bad",
];

class ControlPane {
  public setupAlgInput: HTMLTextAreaElement;
  public algInput: HTMLTextAreaElement;
  public puzzleSelect: HTMLSelectElement;
  constructor(
    public element: Element,
    initialData: AppData,
    private setupAlgChangeCallback: (alg: Sequence) => boolean,
    private algChangeCallback: (alg: Sequence) => boolean,
    private setPuzzleCallback: (puzzleName: string) => boolean,
  ) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

    this.setupAlgInput = findOrCreateChildWithClass(
      this.element,
      "setup-alg",
      "textarea",
    );
    this.setupAlgInput.placeholder = ALG_SETUP_INPUT_PLACEHOLDER;
    this.setupAlgInput.value = algToString(initialData.setupAlg);
    this.setSetupAlgElemStatus(null);

    this.algInput = findOrCreateChildWithClass(this.element, "alg", "textarea");
    this.algInput.placeholder = ALG_INPUT_PLACEHOLDER;
    this.algInput.value = algToString(initialData.alg);
    this.setAlgElemStatus(null);

    this.puzzleSelect = findOrCreateChildWithClass(
      this.element,
      "puzzle",
      "select",
    );
    this.initializePuzzleSelect(initialData.puzzleName);

    this.algInput.addEventListener("input", this.onAlgInput.bind(this, false));
    this.algInput.addEventListener("change", this.onAlgInput.bind(this, true));

    this.setupAlgInput.addEventListener(
      "input",
      this.onSetupAlgInput.bind(this, false),
    );
    this.setupAlgInput.addEventListener(
      "change",
      this.onSetupAlgInput.bind(this, true),
    );

    this.onAlgInput(true);
  }

  private onSetupAlgInput(canonicalize: boolean): void {
    try {
      const setupAlgString = this.setupAlgInput.value;
      const parsedSetupAlg = parseAlg(setupAlgString);
      this.setupAlgChangeCallback(parsedSetupAlg);

      const restringifiedSetupAlg = algToString(parsedSetupAlg);
      const setupAlgIsCanonical = restringifiedSetupAlg === setupAlgString;

      if (canonicalize && !setupAlgIsCanonical) {
        this.setupAlgInput.value = restringifiedSetupAlg;
      }
      // Set status before passing to the `Twisty`.
      this.setSetupAlgElemStatus(
        canonicalize || setupAlgIsCanonical ? null : "status-warning",
      );

      // TODO: cache last alg to avoid unnecessary updates?
      // Or should that be in the `Twisty` layer?
      if (!this.setupAlgChangeCallback(parsedSetupAlg)) {
        this.setSetupAlgElemStatus("status-bad");
      }
    } catch (e) {
      this.setSetupAlgElemStatus("status-bad");
    }
  }

  private onAlgInput(canonicalize: boolean): void {
    try {
      const algString = this.algInput.value;
      const parsedAlg = parseAlg(algString);
      this.algChangeCallback(parsedAlg);

      const restringifiedAlg = algToString(parsedAlg);
      const algIsCanonical = restringifiedAlg === algString;

      if (canonicalize && !algIsCanonical) {
        this.algInput.value = restringifiedAlg;
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
  private setSetupAlgElemStatus(
    latestStatusClass: AlgElemStatusClass | null,
  ): void {
    for (const statusClass of algElemStatusClasses) {
      if (statusClass === latestStatusClass) {
        this.setupAlgInput.classList.add(statusClass);
      } else {
        this.setupAlgInput.classList.remove(statusClass);
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
    for (const puzzleName in puzzles) {
      const option = document.createElement("option");
      option.value = puzzleName;
      option.textContent = puzzles[puzzleName].displayName();
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
}
