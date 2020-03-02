import { algToString, parse, Sequence } from "../../src/alg";
import { KPuzzleDefinition } from "../../src/kpuzzle";
import { Twisty } from "../../src/twisty";
import { findOrCreateChild, findOrCreateChildWithClass } from "./dom";
import { ALG_INPUT_PLACEHOLDER, APP_TITLE } from "./strings";

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
      alg: initialData.alg,
    });
    puzzlePane.appendChild(twistyElem);

    const controlPaneElem = findOrCreateChild(this.element, "control-pane", "control-pane");
    controlPaneElem.classList.remove("loading");
    this.controlPane = new ControlPane(controlPaneElem, initialData, this.onAlgChange.bind(this));
  }

  private onAlgChange(alg: Sequence): void {
    this.twisty.experimentalSetAlg(alg);
  }
}

// TODO: Generate type from list.
type AlgElemStatusClass = "status-warning" | "status-bad";
const algElemStatusClasses: AlgElemStatusClass[] = ["status-warning", "status-bad"];

class ControlPane {
  public algInput: HTMLTextAreaElement;
  constructor(public element: Element, initialData: AppData, private algChangeCallback: (alg: Sequence) => void) {
    const appTitleElem = findOrCreateChildWithClass(this.element, "title");
    appTitleElem.textContent = APP_TITLE;

    this.algInput = findOrCreateChildWithClass(this.element, "alg", "textarea");
    this.algInput.placeholder = ALG_INPUT_PLACEHOLDER;
    this.algInput.value = algToString(initialData.alg);
    this.setAlgElemStatus(null);
    this.element.appendChild(this.algInput);

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
      this.setAlgElemStatus(canonicalize || algIsCanonical ? null : "status-warning");

      // TODO: cche last alg to avoid unnecessary updates?
      // Or should that be in the `Twisty` layer?
      this.algChangeCallback(parsedAlg);
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
}
