import { TwistyViewerElement } from "./TwistyViewerElement";
import {
  PositionListener,
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { RenderScheduler } from "../../animation/RenderScheduler";

// <twisty-2d-svg>
export class Twisty2DSVG extends SVGElement
  implements TwistyViewerElement, PositionListener {
  private scheduler = new RenderScheduler(this.render.bind(this));
  constructor(cursor: PositionDispatcher) {
    super();
    /*...*/
    cursor.addPositionListener(this);
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
