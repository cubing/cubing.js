import {
  combineTransformations,
  KPuzzleDefinition,
  KPuzzleSVGWrapper,
  Transformation,
  transformationForTurn,
} from "../../../kpuzzle";
import { PuzzleAppearance } from "../../3D/puzzles/appearance";
import { appearances3x3x3 } from "../../3D/puzzles/stickerings";
import {
  PositionDispatcher,
  PositionListener,
} from "../../animation/cursor/AlgCursor";
import { Direction, PuzzlePosition } from "../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../animation/RenderScheduler";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import { ExperimentalStickering } from "../TwistyPlayerConfig";
import { twisty2DSVGCSS } from "./Twisty2DSVGView.css";
import { TwistyViewerElement } from "./TwistyViewerElement";

export interface Twisty2DSVGOptions {
  experimentalStickering?: ExperimentalStickering;
}

// <twisty-2d-svg>
export class Twisty2DSVG
  extends ManagedCustomElement
  implements TwistyViewerElement, PositionListener {
  private definition: KPuzzleDefinition;
  private svg: KPuzzleSVGWrapper;
  private scheduler = new RenderScheduler(this.render.bind(this));
  #cachedPosition: PuzzlePosition | null = null; // TODO: pull when needed.
  constructor(
    cursor?: PositionDispatcher,
    def?: KPuzzleDefinition,
    private svgSource?: string,
    private options?: Twisty2DSVGOptions,
  ) {
    super();
    this.addCSS(twisty2DSVGCSS);

    this.definition = def!;
    this.resetSVG(); // TODO
    cursor?.addPositionListener(this); // TODO

    if (this.options?.experimentalStickering) {
      this.experimentalSetStickering(this.options.experimentalStickering);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onPositionChange(position: PuzzlePosition): void {
    if (position.turnsInProgress.length > 0) {
      const turn = position.turnsInProgress[0].turn;

      const def = this.definition;
      let partialTurn = turn;
      if (position.turnsInProgress[0].direction === Direction.Backwards) {
        partialTurn = turn.inverse();
      }
      const newState = combineTransformations(
        def,
        position.state as Transformation,
        transformationForTurn(def, partialTurn),
      );
      // TODO: turn to render()
      this.svg.draw(
        this.definition,
        position.state as Transformation,
        newState,
        position.turnsInProgress[0].fraction,
      );
    } else {
      this.svg.draw(this.definition, position.state as Transformation);
      this.#cachedPosition = position;
    }
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  experimentalSetStickering(stickering: ExperimentalStickering): void {
    const appearance = appearances3x3x3[stickering];
    this.resetSVG(appearance);
  }

  // TODO: do this without constructing a new SVG.
  private resetSVG(appearance?: PuzzleAppearance): void {
    if (this.svg) {
      this.returnElement(this.svg.element);
    }
    if (!this.definition) {
      return; // TODO
    }
    this.svg = new KPuzzleSVGWrapper(
      this.definition,
      this.svgSource!,
      appearance,
    ); // TODO
    this.addElement(this.svg.element);
    if (this.#cachedPosition) {
      this.onPositionChange(this.#cachedPosition);
    }
  }

  private render(): void {
    /*...*/
  }
}

customElementsShim.define("twisty-2d-svg", Twisty2DSVG);
