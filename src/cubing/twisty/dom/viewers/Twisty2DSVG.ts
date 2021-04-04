import {
  combineTransformations,
  KPuzzleDefinition,
  KPuzzleSVGWrapper,
  Transformation,
  transformationForMove,
} from "../../../kpuzzle";
import { PuzzleLoader } from "../../../puzzles/PuzzleLoader";
import { PuzzleAppearance } from "../../../puzzles/stickerings/appearance";
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
    private puzzleLoader?: PuzzleLoader,
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
    if (position.movesInProgress.length > 0) {
      const move = position.movesInProgress[0].move;

      const def = this.definition;
      let partialMove = move;
      if (position.movesInProgress[0].direction === Direction.Backwards) {
        partialMove = move.invert();
      }
      const newState = combineTransformations(
        def,
        position.state as Transformation,
        transformationForMove(def, partialMove),
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
      this.#cachedPosition = position;
    }
  }

  scheduleRender(): void {
    this.scheduler.requestAnimFrame();
  }

  experimentalSetStickering(stickering: ExperimentalStickering): void {
    (async () => {
      if (!this.puzzleLoader?.appearance) {
        return;
      }
      const appearance = await this.puzzleLoader.appearance(stickering);
      this.resetSVG(appearance);
    })();
  }

  // TODO: do this without constructing a new SVG.
  private resetSVG(appearance?: PuzzleAppearance): void {
    if (this.svg) {
      this.removeElement(this.svg.element);
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
