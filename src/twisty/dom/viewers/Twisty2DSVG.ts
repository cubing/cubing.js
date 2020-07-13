import { TwistyViewerElement } from "./TwistyViewerElement";
import {
  PositionListener,
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { SVG, Puzzles } from "../../../kpuzzle";

// <twisty-2d-svg>
export class Twisty2DSVG extends HTMLElement
  implements TwistyViewerElement, PositionListener {
  private scheduler = new RenderScheduler(this.render.bind(this));
  constructor(cursor?: PositionDispatcher) {
    super();
    /*...*/
    cursor!.addPositionListener(this);
  }

  connectedCallback() {
    const svg = new SVG(Puzzles["3x3x3"]);
    this.appendChild(svg.element);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onPositionChange(position: PuzzlePosition): void {
    /*..*/
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  private render(): void {
    /*...*/
  }
}

if (customElements) {
  customElements.define("twisty-2d-svg", Twisty2DSVG);
}
