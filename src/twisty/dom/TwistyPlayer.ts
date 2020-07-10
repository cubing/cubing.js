import { Sequence } from "../../alg";
import { PositionDispatcher, AlgCursor } from "../animation/alg/AlgCursor";
import { TwistyViewerElement } from "./viewers/TwistyViewerElement";
import { Twisty3DCanvas } from "./viewers/Twisty3DCanvas";
import { Twisty2DSVG } from "./viewers/Twisty2DSVG";
import { TwistyControlButtonGrid } from "./controls/buttons";
import { TwistyScrubber } from "./controls/TwistyScrubber";
import { TwistyControlElement } from "./controls/TwistyControlElement.ts";
import { Timeline } from "../animation/Timeline";
import { Twisty3DScene, Twisty3DPuzzle } from "../3D/3D";

// <twisty-player>
export class TwistyPlayerTest extends HTMLElement {
  viewers: TwistyViewerElement[];
  controls: TwistyControlElement[];
  // TODO: support config from DOM.
  constructor(alg: Sequence = new Sequence([])) {
    super();
    const timeline = new Timeline();
    const viewer = this.createViewer(timeline, alg, "3D");
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
    this.appendChild(this.viewers[0]);
    this.appendChild(this.controls[0]);
    this.appendChild(this.controls[1]);
  }
}

if (typeof customElements !== "undefined") {
  customElements.define("twisty-player-test", TwistyPlayerTest);
}
