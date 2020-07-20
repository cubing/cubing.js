import { Sequence } from "../../alg";
import { Twisty3DPuzzle, Twisty3DScene } from "../3D/3D";
import { AlgCursor, PositionDispatcher } from "../animation/alg/AlgCursor";
import { Timeline } from "../animation/Timeline";
import { TwistyControlButtonGrid } from "./controls/buttons";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { testCSS } from "./css";
import { CustomElementManager } from "./ManagedCustomElement";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { Twisty3DCanvas } from "./viewers/Twisty3DCanvas";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";

// <twisty-player>
export class TwistyPlayerTest extends HTMLElement {
  #manager: CustomElementManager;
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  // TODO: support config from DOM.
  constructor(alg: Sequence = new Sequence([])) {
    super();
    this.#manager = new CustomElementManager(
      this.attachShadow.call(this, {
        mode: "closed",
      }),
    ); // TODO: open???);

    const timeline = new Timeline();
    const viewer = this.createViewer(timeline, alg, "2D"); // TODO
    const scrubber = new TwistyScrubber(timeline);
    const controlButtonGrid = new TwistyControlButtonGrid(timeline, this);
    this.viewers = [viewer];
    this.controls = [scrubber, controlButtonGrid];
  }

  fullscreen(): void {
    this.requestFullscreen();
  }

  createViewer(
    timeline: Timeline,
    alg: Sequence,
    visualization: "2D" | "3D",
  ): TwistyViewerElement {
    const cursor: PositionDispatcher = new AlgCursor(timeline, alg);
    switch (visualization) {
      case "2D":
        return new Twisty2DSVG(cursor);
      case "3D": {
        const twisty3DScene = new Twisty3DScene();
        const twisty3DPuzzle = new Twisty3DPuzzle(twisty3DScene, cursor);
        twisty3DScene.addTwisty3DPuzzle(twisty3DPuzzle);
        return new Twisty3DCanvas();
      }
    }
  }

  protected connectedCallback(): void {
    this.#manager.addElement(this.viewers[0]);
    this.#manager.addElement(this.controls[0]);
    this.#manager.addElement(this.controls[1]);

    this.#manager.addCSS(testCSS);
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player-test", TwistyPlayerTest);
}
