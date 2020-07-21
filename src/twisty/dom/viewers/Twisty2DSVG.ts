import { TwistyViewerElement } from "./TwistyViewerElement";
import {
  PositionListener,
  PositionDispatcher,
  PuzzlePosition,
} from "../../animation/alg/AlgCursor";
import { RenderScheduler } from "../../animation/RenderScheduler";
import {
  SVG,
  Puzzles,
  KPuzzleDefinition,
  Combine,
  Transformation,
  stateForBlockMove,
} from "../../../kpuzzle";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { twisty2DSVGCSS } from "./Twisty2DSVGView.css";
import { BlockMove } from "../../../alg";

// <twisty-2d-svg>
export class Twisty2DSVG extends ManagedCustomElement
  implements TwistyViewerElement, PositionListener {
  private definition: KPuzzleDefinition;
  private svg: SVG;
  private scheduler = new RenderScheduler(this.render.bind(this));
  constructor(cursor?: PositionDispatcher) {
    super();
    this.addCSS(twisty2DSVGCSS);

    this.definition = Puzzles["3x3x3"]; // TODO
    this.svg = new SVG(this.definition);
    this.addElement(this.svg.element);
    cursor!.addPositionListener(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onPositionChange(position: PuzzlePosition): void {
    if (position.movesInProgress.length > 0) {
      const move = position.movesInProgress[0].move as BlockMove;

      const def = this.definition;
      const partialMove = new BlockMove(
        move.outerLayer,
        move.innerLayer,
        move.family,
        move.amount * position.movesInProgress[0].direction,
      );
      const newState = Combine(
        def,
        position.state as Transformation,
        stateForBlockMove(def, partialMove),
      );
      // TODO: move to render()
      this.svg.draw(
        this.definition,
        position.state as Transformation,
        newState,
        position.movesInProgress[0].fraction,
      );
    } else {
      this.svg.draw(this.definition, position.state as Transformation);
    }
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
