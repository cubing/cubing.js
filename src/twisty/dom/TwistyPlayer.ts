import { Example, Sequence } from "../../alg";
import { Puzzles } from "../../kpuzzle";
import { AlgCursor, PositionDispatcher } from "../animation/alg/AlgCursor";
import { Timeline } from "../animation/Timeline";
import { TwistyControlButtonPanel } from "./controls/buttons";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { ManagedCustomElement } from "./ManagedCustomElement";
import { twistyPlayerCSS } from "./TwistyPlayer.css";
import { Cube3DCanvas } from "./viewers/Cube3DCanvas";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";

// <twisty-player>
export class TwistyPlayerTest extends ManagedCustomElement {
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  // TODO: support config from DOM.
  constructor(alg: Sequence = new Sequence([])) {
    super();

    alg = Example.Sune; // TODO

    const timeline = new Timeline();
    const viewer = this.createViewer(timeline, alg, "3D"); // TODO
    const scrubber = new TwistyScrubber(timeline);
    const controlButtonGrid = new TwistyControlButtonPanel(timeline, this);
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
    const cursor: PositionDispatcher = new AlgCursor(
      timeline,
      Puzzles["3x3x3"],
      alg,
    );
    switch (visualization) {
      case "2D":
        return new Twisty2DSVG(cursor);
      case "3D": {
        // const twisty3DScene = new Twisty3DScene();
        // const twisty3DPuzzle = new Twisty3DPuzzle(twisty3DScene, cursor);
        // twisty3DScene.addTwisty3DPuzzle(twisty3DPuzzle);
        return new Cube3DCanvas(cursor);
      }
    }
  }

  protected connectedCallback(): void {
    this.addElement(this.viewers[0]);
    this.addElement(this.controls[0]);
    this.addElement(this.controls[1]);

    this.addCSS(twistyPlayerCSS);
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player-test", TwistyPlayerTest);
}
