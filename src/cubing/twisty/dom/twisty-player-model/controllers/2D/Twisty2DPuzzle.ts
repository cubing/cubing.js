import {
  combineTransformations,
  KPuzzleDefinition,
  KPuzzleSVGWrapper,
  Transformation,
  transformationForMove,
} from "../../../../../kpuzzle";
import type { PuzzleLoader } from "../../../../../puzzles/PuzzleLoader";
import type { PuzzleAppearance } from "../../../../../puzzles/stickerings/appearance";
import type { PositionListener } from "../../../../animation/cursor/AlgCursor";
import {
  Direction,
  PuzzlePosition,
} from "../../../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../../element/ManagedCustomElement";
import { customElementsShim } from "../../../element/node-custom-element-shims";
import type { TwistyPlayerModel } from "../../props/TwistyPlayerModel";
import { FreshListenerManager } from "../../props/TwistyProp";
import type { ExperimentalStickering } from "../../../TwistyPlayerConfig";
import { twisty2DSVGCSS } from "../../../viewers/Twisty2DSVGView.css_";
import type { TwistyViewerElement } from "../../../viewers/TwistyViewerElement";

export interface Twisty2DPuzzleOptions {
  experimentalStickering?: ExperimentalStickering;
}

// <twisty-2d-svg>
export class Twisty2DPuzzle
  extends ManagedCustomElement
  implements TwistyViewerElement, PositionListener
{
  private definition: KPuzzleDefinition;
  private svg: KPuzzleSVGWrapper;
  private scheduler = new RenderScheduler(this.render.bind(this));
  #cachedPosition: PuzzlePosition | null = null; // TODO: pull when needed.
  constructor(
    private model?: TwistyPlayerModel,
    def?: KPuzzleDefinition,
    private svgSource?: string,
    private options?: Twisty2DPuzzleOptions,
    private puzzleLoader?: PuzzleLoader,
  ) {
    super();
    this.addCSS(twisty2DSVGCSS);

    this.definition = def!;
    this.resetSVG(); // TODO: do this in `connectedCallback()`?

    this.#freshListenerManager.addListener(
      this.model!.positionProp,
      this.onPositionChange.bind(this),
    );

    if (this.options?.experimentalStickering) {
      this.experimentalSetStickering(this.options.experimentalStickering);
    }
  }

  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
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

customElementsShim.define("twisty-2d-puzzle", Twisty2DPuzzle);
