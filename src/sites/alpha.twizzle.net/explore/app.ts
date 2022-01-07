import type { PuzzleGeometry } from "../../../cubing/puzzle-geometry";
import type { TwistyAlgEditor, TwistyPlayer } from "../../../cubing/twisty";
import { constructTwistyPlayer } from "./config";

export class TwizzleExplorerApp {
  twistyPlayer: TwistyPlayer;
  twistyAlgEditor: TwistyAlgEditor;
  constructor() {
    this.twistyPlayer = constructTwistyPlayer();
    document.querySelector("#twisty-wrapper")?.appendChild(this.twistyPlayer);

    this.twistyAlgEditor = document.querySelector("twisty-alg-editor")!;
    this.twistyAlgEditor.twistyPlayer = this.twistyPlayer;

    new ConfigUI();
    new ActionsDropdown(this);
  }

  // TODO: Find out how to avoid the need for this.
  async puzzleGeometry(): Promise<PuzzleGeometry> {
    const puzzleLoader =
      await this.twistyPlayer.experimentalModel.puzzleLoaderProp.get();

    if (!puzzleLoader.pg) {
      throw new Error("could not get PG from puzzle loader");
    }
    return puzzleLoader.pg();
  }

  showText(text: string): void {
    // TODO
    console.log(text);
    navigator.clipboard.writeText(text);
  }
}

class ConfigUI {
  toggleButton = document.body.querySelector(
    "#config-toggle",
  ) as HTMLButtonElement;
  descWrapper = document.body.querySelector(
    "#desc-wrapper",
  ) as HTMLInputElement;
  optionsContainer = document.body.querySelector(
    "#main-config",
  ) as HTMLInputElement;
  constructor() {
    this.toggleButton.addEventListener("click", () => {
      // TODO: Handle this with a single CSS class on the whole app.
      this.descWrapper.toggleAttribute("hidden");
      this.optionsContainer.toggleAttribute("hidden");
    });
    // TODO: connect this to the checkboxes?
  }
}

class ActionsDropdown {
  element = document.body.querySelector("#actions") as HTMLInputElement;
  constructor(private app: TwizzleExplorerApp) {
    this.element.addEventListener("change", this.onChange.bind(this));
  }

  async onChange() {
    const action = this.element.value;
    switch (action) {
      case "gap":
        this.app.showText((await this.app.puzzleGeometry()).writegap());
        break;
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
      case "ksolve":
        this.app.showText(
          (await this.app.puzzleGeometry()).writeksolve("TwizzlePuzzle"),
        );
        break;
      case "svgcmd": {
        const is3D =
          (await this.app.twistyPlayer.experimentalModel.visualizationFormatProp.get()) !==
          "2D"; // TODO
        this.app.showText(
          (await this.app.puzzleGeometry()).generatesvg(800, 500, 10, is3D),
        );
        break;
      }
      case "screenshot":
      case "screenshot-back":
        this.app.twistyPlayer.experimentalDownloadScreenshot(); // TODO: back!
        break;
      default:
        alert(`Action ${action} not handled yet.`);
    }
  }
}
