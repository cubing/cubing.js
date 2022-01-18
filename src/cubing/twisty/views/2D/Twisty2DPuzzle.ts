import {
  oldCombineTransformations,
  OldKPuzzleDefinition,
  OldKPuzzleSVGWrapper,
  oldTransformationForMove,
} from "../../../kpuzzle";
import type { PuzzleLoader } from "../../../puzzles/PuzzleLoader";
import type { PuzzleAppearance } from "../../../puzzles/stickerings/appearance";
import {
  Direction,
  PositionListener,
  PuzzlePosition,
} from "../../controllers/AnimationTypes";
import { RenderScheduler } from "../../controllers/RenderScheduler";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import { twisty2DSVGCSS } from "./Twisty2DPuzzle.css";
import type { ExperimentalStickering, PuzzleID } from "../..";

export interface Twisty2DPuzzleOptions {
  experimentalStickering?: ExperimentalStickering;
}

// <twisty-2d-svg>
export class Twisty2DPuzzle
  extends ManagedCustomElement
  implements PositionListener
{
  private definition: OldKPuzzleDefinition;
  public svg: OldKPuzzleSVGWrapper;
  private scheduler = new RenderScheduler(this.render.bind(this));
  #cachedPosition: PuzzlePosition | null = null; // TODO: pull when needed.
  constructor(
    private model?: TwistyPlayerModel,
    def?: OldKPuzzleDefinition,
    private svgSource?: string,
    private options?: Twisty2DPuzzleOptions,
    private puzzleLoader?: PuzzleLoader,
  ) {
    super();
    this.addCSS(twisty2DSVGCSS);

    this.definition = def!;
    this.resetSVG(); // TODO: do this in `connectedCallback()`?

    this.#freshListenerManager.addListener(
      this.model!.puzzleIDProp,
      (puzzleID: PuzzleID) => {
        if (puzzleLoader?.id !== puzzleID) {
          this.disconnect();
        }
      },
    );

    this.#freshListenerManager.addListener(
      this.model!.legacyPositionProp,
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

  onPositionChange(position: PuzzlePosition): void {
    try {
      if (position.movesInProgress.length > 0) {
        const move = position.movesInProgress[0].move;

        const def = this.definition;
        let partialMove = move;
        if (position.movesInProgress[0].direction === Direction.Backwards) {
          partialMove = move.invert();
        }
        const newState = oldCombineTransformations(
          def,
          position.state,
          oldTransformationForMove(def, partialMove),
        );
        // TODO: move to render()
        this.svg.draw(
          this.definition,
          position.state,
          newState,
          position.movesInProgress[0].fraction,
        );
      } else {
        this.svg.draw(this.definition, position.state);
        this.#cachedPosition = position;
      }
    } catch (e) {
      console.warn(
        "Bad position (this doesn't necessarily mean something is wrong). Pre-emptively disconnecting:",
        this.puzzleLoader?.id,
        e,
      );
      this.disconnect();
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
    this.svg = new OldKPuzzleSVGWrapper(
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
