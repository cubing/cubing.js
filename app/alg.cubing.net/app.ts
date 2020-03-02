import { algToString, parse, Sequence } from "../../src/alg";
import { KPuzzleDefinition, Puzzles } from "../../src/kpuzzle";
import { Twisty } from "../../src/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { kPuzzleToAcnName } from "./puzzles";
import { ALG_INPUT_PLACEHOLDER, APP_TITLE } from "./strings";
import { setURLParams } from "./url-params";

export interface AppData {
  puzzle: KPuzzleDefinition;
  alg: Sequence;
}

export class App {
  public twisty: Twisty;
  public controlPane: ControlPane; // TODO: Not public?
  constructor(public element: Element, initialData: AppData) {
    const puzzlePane = findOrCreateChild(this.element, "puzzle-pane", "puzzle-pane");
    puzzlePane.classList.remove("loading");
    const spinner = puzzlePane.querySelector(".spinner");
    if (spinner) {
      puzzlePane.removeChild(spinner);
    }

    const twistyElem = document.createElement("twisty");
    this.twisty = new Twisty(twistyElem, {
      puzzle: initialData.puzzle,
      alg: new Sequence([]),
    });
    this.setAlg(initialData.alg);
    puzzlePane.appendChild(twistyElem);

    const controlPaneElem = findOrCreateChild(this.element, "control-pane", "control-pane");
    controlPaneElem.classList.remove("loading");
    this.controlPane = new ControlPane(controlPaneElem, initialData, this.setAlg.bind(this), this.setPuzzle.bind(this));
  }

  // Boolean indicates success (e.g. alg is valid).
  private setAlg(alg: Sequence): boolean {
    try {
      this.twisty.experimentalSetAlg(alg);
      setURLParams({ alg });
      return true;
    } catch (e) {
      return false;
    }
  }

  private setPuzzle(puzzleName: string): boolean {
    setURLParams({ puzzle: puzzleName });
    location.reload();
    return true;
  }
}

// TODO: Generate type from list.
type AlgElemStatusClass = "status-warning" | "status-bad";
const algElemStatusClasses: AlgElemStatusClass[] = ["status-warning", "status-bad"];

class ControlPane {
  public algInput: HTMLTextAreaElement;
  public puzzleSelect: HTMLSelectElement;
  constructor(public element: Element, initialData: AppData, private algChangeCallback: (alg: Sequence) => boolean, private setPuzzleCallback: (puzzleName: string) => boolean) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

    this.algInput = findOrCreateChildWithClass(this.element, "alg", "textarea");
    this.algInput.placeholder = ALG_INPUT_PLACEHOLDER;
    this.algInput.value = algToString(initialData.alg);
    this.setAlgElemStatus(null);

    this.puzzleSelect = findOrCreateChildWithClass(this.element, "puzzle", "select");
    this.initializePuzzleSelect(initialData.puzzle.name);

    this.algInput.addEventListener("input", this.onAlgInput.bind(this, false));
    this.algInput.addEventListener("change", this.onAlgInput.bind(this, true));

    this.onAlgInput(true);
  }

  private onAlgInput(canonicalize: boolean): void {
    try {
      const algString = this.algInput.value;
      const parsedAlg = parse(algString);
      this.algChangeCallback(parsedAlg);

      const restringifiedAlg = algToString(parsedAlg);
      const algIsCanonical = restringifiedAlg === algString;

      if (canonicalize && !algIsCanonical) {
        this.algInput.value = restringifiedAlg;
      }
      // Set status before passing to the `Twisty`.
      this.setAlgElemStatus(canonicalize || algIsCanonical ? null : "status-warning");

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
    for (const puzzleName in Puzzles) {
      const option = document.createElement("option");
      option.value = puzzleName;
      option.textContent = kPuzzleToAcnName(puzzleName);
      this.puzzleSelect.appendChild(option);
      if (puzzleName === initialPuzzleName) {
        option.selected = true;
      }
    }
    this.puzzleSelect.addEventListener("change", this.puzzleSelectChanged.bind(this));
  }

  private puzzleSelectChanged(): void {
    const option = this.puzzleSelect.selectedOptions[0];
    this.setPuzzleCallback(option.value);
  }
}
