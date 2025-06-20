import type { KPuzzle } from "../../../kpuzzle";
import type { ExperimentalStickeringMask } from "../../../puzzles/cubing-private";
import type { PuzzleLoader } from "../../../puzzles/PuzzleLoader";
import type { StickeringMask } from "../../../puzzles/stickerings/mask";
import type { PuzzleID } from "../..";
import {
  Direction,
  type PositionListener,
  type PuzzlePosition,
} from "../../controllers/AnimationTypes";
import { RenderScheduler } from "../../controllers/RenderScheduler";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { twisty2DSVGCSS } from "./Twisty2DPuzzle.css";
import { TwistyAnimatedSVG } from "./TwistyAnimatedSVG";

export interface Twisty2DPuzzleOptions {
  experimentalStickeringMask?: ExperimentalStickeringMask;
}

// <twisty-2d-svg>
export class Twisty2DPuzzle
  extends ManagedCustomElement
  implements PositionListener
{
  public svgWrapper?: TwistyAnimatedSVG;
  private scheduler = new RenderScheduler(this.render.bind(this));
  #cachedPosition: PuzzlePosition | null = null; // TODO: pull when needed.
  constructor(
    private model?: TwistyPlayerModel,
    private kpuzzle?: KPuzzle,
    private svgSource?: string,
    private options?: Twisty2DPuzzleOptions,
    private puzzleLoader?: PuzzleLoader,
  ) {
    super();
    this.addCSS(twisty2DSVGCSS);

    this.resetSVG(); // TODO: do this in `connectedCallback()`?

    this.#freshListenerManager.addListener(
      this.model!.puzzleID,
      (puzzleID: PuzzleID) => {
        if (puzzleLoader?.id !== puzzleID) {
          this.disconnect();
        }
      },
    );

    this.#freshListenerManager.addListener(
      this.model!.legacyPosition,
      this.onPositionChange.bind(this),
    );

    if (this.options?.experimentalStickeringMask) {
      this.experimentalSetStickeringMask(
        this.options.experimentalStickeringMask,
      );
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

        let partialMove = move;
        if (position.movesInProgress[0].direction === Direction.Backwards) {
          partialMove = move.invert();
        }
        const newPattern = position.pattern.applyMove(partialMove);
        // TODO: move to render()
        this.svgWrapper?.draw(
          position.pattern,
          newPattern,
          position.movesInProgress[0].fraction,
        );
      } else {
        this.svgWrapper?.draw(position.pattern);
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

  experimentalSetStickeringMask(
    stickeringMask: ExperimentalStickeringMask,
  ): void {
    this.resetSVG(stickeringMask);
  }

  // TODO: do this without constructing a new SVG.
  private resetSVG(stickeringMask?: StickeringMask): void {
    if (this.svgWrapper) {
      this.removeElement(this.svgWrapper.wrapperElement);
    }
    if (!this.kpuzzle) {
      return; // TODO
    }
    this.svgWrapper = new TwistyAnimatedSVG(
      this.kpuzzle,
      this.svgSource!,
      stickeringMask,
    ); // TODO
    this.addElement(this.svgWrapper.wrapperElement);
    if (this.#cachedPosition) {
      this.onPositionChange(this.#cachedPosition);
    }
  }

  private render(): void {
    /*...*/
  }
}

customElementsShim.define("twisty-2d-puzzle", Twisty2DPuzzle);
