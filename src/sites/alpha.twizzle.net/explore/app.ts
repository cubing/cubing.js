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
  }
}
