import { Example, parse, Sequence } from "../../alg";
import { Puzzles } from "../../kpuzzle";
import { AlgCursor } from "../animation/alg/AlgCursor";
import { Timeline } from "../animation/Timeline";
import { TwistyControlButtonPanel } from "./controls/buttons";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { ManagedCustomElement } from "./ManagedCustomElement";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import { Cube3DCanvas } from "./viewers/Cube3DCanvas";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";

interface TwistyPlayerInitialConfig {
  alg?: Sequence;
}

class TwistyPlayerConfig {
  alg: Sequence;
  constructor(initialConfig: TwistyPlayerInitialConfig) {
    this.alg = initialConfig.alg ?? Example.Sune; // TODO: change back to empty sequence
  }
}

// <twisty-player>
export class TwistyPlayerTest extends ManagedCustomElement {
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  #timeline: Timeline;
  #cursor: AlgCursor;
  #currentConfig: TwistyPlayerConfig;
  // TODO: support config from DOM.
  constructor(initialConfig: TwistyPlayerInitialConfig = {}) {
    super();

    console.log(this.getAttribute("alg"));

    this.#currentConfig = new TwistyPlayerConfig(initialConfig);

    this.#timeline = new Timeline();
    const viewer = this.createViewer(
      this.#timeline,
      this.#currentConfig.alg,
      "3D",
    ); // TODO
    const scrubber = new TwistyScrubber(this.#timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(
      this.#timeline,
      this,
    );
    this.viewers = [viewer];
    this.controls = [scrubber, controlButtonGrid];

    this.addElement(this.viewers[0]);
    this.addElement(this.controls[0]);
    this.addElement(this.controls[1]);

    this.addCSS(twistyPlayerCSS);
  }

  protected connectedCallback(): void {
    const algAttribute = this.getAttribute("alg");
    console.log(this);
    if (algAttribute) {
      this.#currentConfig.alg = parse(algAttribute);
      console.log(this.#currentConfig);
      this.#timeline.addCursor(this.#cursor);
      // TODO
    }
  }

  fullscreen(): void {
    this.requestFullscreen();
  }

  createViewer(
    timeline: Timeline,
    alg: Sequence,
    visualization: "2D" | "3D",
  ): TwistyViewerElement {
    this.#cursor = new AlgCursor(timeline, Puzzles["3x3x3"], alg);
    switch (visualization) {
      case "2D":
        return new Twisty2DSVG(this.#cursor);
      case "3D": {
        // if ()
        // const twisty3DScene = new Twisty3DScene();
        // const twisty3DPuzzle = new Twisty3DPuzzle(twisty3DScene, this.#cursor);
        // twisty3DScene.addTwisty3DPuzzle(twisty3DPuzzle);
        return new Cube3DCanvas(this.#cursor);
      }
    }
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player-test", TwistyPlayerTest);
}
