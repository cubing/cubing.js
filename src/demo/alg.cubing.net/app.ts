import { algToString, parseAlg, Sequence } from "../../cubing/alg";
import { TwistyPlayer, TwistyPlayerInitialConfig } from "../../cubing/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { puzzles } from "./puzzles";
import { ALG_INPUT_PLACEHOLDER, APP_TITLE } from "./strings";
import { setURLParams } from "./url-params";
import { Vector3 } from "three";

export interface AppData {
  puzzleName: string;
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
      this.setAlg.bind(this),
      this.setPuzzle.bind(this),
    );
  }

  private initializeTwisty(initialData: AppData): void {
    const twistyConfig: TwistyPlayerInitialConfig = {
      alg: new Sequence([]),
    };
    if (initialData.puzzleName === "megaminx") {
      twistyConfig.cameraPosition = new Vector3(0, 3.09, 5);
    }
    const displayablePuzzle = puzzles[initialData.puzzleName];
    twistyConfig.puzzle = displayablePuzzle.puzzleName() as any; // TODO
    twistyConfig.visualization = displayablePuzzle.viz;
    this.twistyPlayer = new TwistyPlayer(twistyConfig);
    this.setAlg(initialData.alg);
    this.puzzlePane.appendChild(this.twistyPlayer);
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
  public algInput: HTMLTextAreaElement;
  public puzzleSelect: HTMLSelectElement;
  constructor(
    public element: Element,
    initialData: AppData,
    private algChangeCallback: (alg: Sequence) => boolean,
    private setPuzzleCallback: (puzzleName: string) => boolean,
  ) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

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

    this.onAlgInput(true);
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
