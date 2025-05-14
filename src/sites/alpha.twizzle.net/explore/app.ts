import {
  connectSmartPuzzle,
  debugKeyboardConnect,
  type MoveEvent,
} from "../../../cubing/bluetooth";
import { KTransformation } from "../../../cubing/kpuzzle";
import {
  getPG3DNamedPuzzles,
  getPuzzleDescriptionString,
  type PuzzleGeometry,
} from "../../../cubing/puzzle-geometry";
import type { PuzzleDescriptionString } from "../../../cubing/puzzle-geometry/PGPuzzles";
import type { PuzzleLoader } from "../../../cubing/puzzles";
import type { TwistyAlgEditor, TwistyPlayer } from "../../../cubing/twisty";
import { constructMoveCountDisplay } from "../../../cubing/twisty/cubing-private";
import { constructTwistyPlayer } from "./twisty-player";
import "./TwistyPuzzleDescriptionInput";
import { getURLParam, setAlgParamEnabled, setURLParams } from "./url-params";

export class TwizzleExplorerApp {
  twistyPlayer: TwistyPlayer;
  twistyAlgEditor: TwistyAlgEditor;
  configUI: ConfigUI;
  dialog: Dialog;
  constructor() {
    this.twistyPlayer = constructTwistyPlayer();
    this.twistyPlayer.experimentalSetFlashLevel("none");
    document.querySelector("#twisty-wrapper")?.appendChild(this.twistyPlayer);

    this.twistyAlgEditor = document.querySelector("twisty-alg-editor")!;
    this.twistyAlgEditor.debugNeverRequestTimestamp = true; // TODO
    this.twistyAlgEditor.twistyPlayer = this.twistyPlayer;

    this.configUI = new ConfigUI(this);
    new SelectUI(this);
    const moveCountElem = document.querySelector("#move-count")! as HTMLElement;
    constructMoveCountDisplay(
      this.twistyPlayer.experimentalModel,
      moveCountElem,
    );

    this.dialog = new Dialog();

    const twistyPuzzleDescriptionInput = document.querySelector(
      "twisty-puzzle-description-input",
    )!;
    this.twistyPlayer.experimentalModel.puzzleLoader.addFreshListener(
      async (puzzleLoader: PuzzleLoader) => {
        // TODO: debounce?
        twistyPuzzleDescriptionInput.puzzleDescription = (
          await puzzleLoader.pg!()
        ).puzzleDescription;
      },
    );
    twistyPuzzleDescriptionInput.addEventListener(
      "puzzle-change",
      ((
        e: CustomEvent<{
          descriptionString: string;
        }>,
      ) => {
        // console.log(e.detail!.descriptionString)
        this.setPuzzleDescription(e.detail.descriptionString);
      }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
  }

  // TODO: Find out how to avoid the need for this.
  async puzzleGeometry(): Promise<PuzzleGeometry> {
    const puzzleLoader =
      await this.twistyPlayer.experimentalModel.puzzleLoader.get();

    if (!puzzleLoader.pg) {
      throw new Error("could not get PG from puzzle loader");
    }
    return puzzleLoader.pg();
  }

  setPuzzleName(puzzleName: string): void {
    const descString = getPuzzleDescriptionString(puzzleName);
    this.configUI.descInput.value = descString;
    this.twistyPlayer.experimentalModel.setupTransformation.set(null);
    setAlgParamEnabled(true);
    this.twistyPlayer.experimentalPuzzleDescription = descString;
    setURLParams({ puzzle: puzzleName, "puzzle-description": "" });
  }

  setPuzzleDescription(descString: PuzzleDescriptionString): void {
    this.configUI.puzzleNameSelect.value = "";
    this.twistyPlayer.experimentalModel.setupTransformation.set(null);
    setAlgParamEnabled(true);
    this.twistyPlayer.experimentalPuzzleDescription = descString;
    this.configUI.descInput.value = descString;
    setURLParams({
      puzzle: "",
      "puzzle-description": descString,
    });
  }

  showText(text: string): void {
    navigator.clipboard.writeText(text);
    this.dialog.show(text);
  }
}

class Dialog {
  dialogElement = document.querySelector(
    "#stuff-for-nerds",
  ) as HTMLDialogElement;
  textarea = this.dialogElement.querySelector(
    "textarea",
  ) as HTMLTextAreaElement;

  show(text: string): void {
    this.textarea.value = text;
    (this.dialogElement as any).showModal();
  }
}

class ConfigUI {
  puzzleNameSelect = document.body.querySelector(
    "#puzzle-name",
  ) as HTMLSelectElement;
  scrambleButton = document.body.querySelector(
    "#scramble",
  ) as HTMLButtonElement;
  resetButton = document.body.querySelector("#reset") as HTMLButtonElement;
  toggleButton = document.body.querySelector(
    "#config-toggle",
  ) as HTMLButtonElement;
  descWrapper = document.body.querySelector(
    "#puzzle-description-wrapper",
  ) as HTMLInputElement;
  descInput = document.body.querySelector(
    "#puzzle-description-string",
  ) as HTMLInputElement;
  optionsContainer = document.body.querySelector(
    "#main-config",
  ) as HTMLInputElement;
  showing: boolean = false;
  constructor(private app: TwizzleExplorerApp) {
    this.toggleButton.addEventListener("click", () => {
      this.showing = !this.showing;
      // TODO: Handle this with a single CSS class on the whole app.
      this.descWrapper.toggleAttribute("hidden", !this.showing);
      this.optionsContainer.toggleAttribute("hidden", !this.showing);
    });

    for (const name of Object.keys(getPG3DNamedPuzzles())) {
      const optionElem = document.createElement("option");
      optionElem.value = name;
      optionElem.textContent = name;
      this.puzzleNameSelect.appendChild(optionElem);
    }

    const puzzleDescriptionString = getURLParam("puzzle-description");
    if (getURLParam("puzzle-description")) {
      this.descInput.value = puzzleDescriptionString;
      this.descWrapper.hidden = false;
    } else {
      let puzzleName = getURLParam("puzzle");
      if (!puzzleName) {
        puzzleName = "3x3x3";
      }
      this.puzzleNameSelect.value = puzzleName;
      this.descInput.value = getPuzzleDescriptionString(puzzleName);
    }

    this.scrambleButton.addEventListener("click", async () => {
      this.app.twistyPlayer.experimentalModel.setupTransformation.set(
        (async () => {
          const loader =
            await this.app.twistyPlayer.experimentalModel.puzzleLoader.get();
          const pg = await loader.pg!();
          const kpuzzle = await loader.kpuzzle();
          const scrambleTransformationData = pg.getScramble();
          setAlgParamEnabled(false);
          return new KTransformation(kpuzzle, scrambleTransformationData);
        })(),
      );
    });

    this.resetButton.addEventListener("click", () => {
      this.app.twistyPlayer.alg = "";
      this.app.twistyPlayer.experimentalModel.setupTransformation.set(null);
      setAlgParamEnabled(true);
    });

    // TODO: connect this to the checkboxes?
    this.puzzleNameSelect.addEventListener("change", () => {
      this.app.setPuzzleName(this.puzzleNameSelect.value);
    });

    // TODO: connect this to the checkboxes?
    this.descInput.addEventListener("input", () => {
      this.app.setPuzzleDescription(this.descInput.value);
    });
  }
}

class SelectUI {
  constructor(private app: TwizzleExplorerApp) {
    (
      document.body.querySelector("#actions") as HTMLSelectElement
    ).addEventListener(
      "change",
      this.onChange.bind(this) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
    (
      document.body.querySelector("#move-input") as HTMLSelectElement
    ).addEventListener(
      "change",
      this.onChange.bind(this) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
  }

  async onChange(e: MouseEvent) {
    const action = (e.target as HTMLSelectElement).value;
    (document.body.querySelector("#actions") as HTMLSelectElement).value = "";
    (document.body.querySelector("#move-input") as HTMLSelectElement).value =
      "";
    switch (action) {
      case "gap": {
        this.app.showText((await this.app.puzzleGeometry()).writegap());
        break;
      }
      case "mathematica": {
        this.app.showText((await this.app.puzzleGeometry()).writemathematica());
        break;
      }
      case "ss": {
        const lines: string[] = [];
        (await this.app.puzzleGeometry()).writeSchreierSims((line) =>
          lines.push(line),
        );
        this.app.showText(lines.join("\n"));
        break;
      }
      case "canon": {
        const lines: string[] = [];
        (await this.app.puzzleGeometry()).showcanon((line) => lines.push(line));
        this.app.showText(lines.join("\n"));
        break;
      }
      case "ksolve": {
        this.app.showText(
          (await this.app.puzzleGeometry()).writeksolve("TwizzlePuzzle"),
        );
        break;
      }
      case "svg": {
        const is3D =
          (await this.app.twistyPlayer.experimentalModel.visualizationFormat.get()) !==
          "2D"; // TODO
        this.app.showText(
          (await this.app.puzzleGeometry()).generatesvg(800, 500, 10, is3D),
        );
        break;
      }
      case "summary": {
        this.app.showText(
          (
            await (
              await this.app.twistyPlayer.experimentalModel.puzzleLoader.get()
            ).pg!()
          ).textForTwizzleExplorer(),
        );
        break;
      }
      case "screenshot":
      case "screenshot-back": {
        this.app.twistyPlayer.experimentalDownloadScreenshot(); // TODO: back!
        break;
      }
      case "bluetooth":
      case "keyboard": {
        (async (): Promise<void> => {
          const inputPuzzle = await (action === "bluetooth"
            ? connectSmartPuzzle
            : debugKeyboardConnect)();
          inputPuzzle.addAlgLeafListener((e: MoveEvent) => {
            this.app.twistyPlayer.experimentalAddAlgLeaf(e.latestAlgLeaf);
          });
        })();
        break;
      }
      default:
        alert(`Action ${action} not handled yet.`);
    }
  }
}

class SidePanel extends HTMLElement {
  connectedCallback() {
    const buttons = this.querySelectorAll("panel-selector button");
    for (const button of Array.from(buttons)) {
      button.addEventListener("click", () => {
        this.showTab(button.getAttribute("data-tab-id")!);
      });
    }
  }

  showTab(id: string) {
    for (const child of Array.from(
      this.querySelector("panel-tabs")!.children,
    ) as HTMLElement[]) {
      child.hidden = true;
    }
    document.getElementById(id)!.hidden = false;
  }
}
customElements.define("side-panel", SidePanel);
