import type { PuzzleLoader } from "../../../puzzles/PuzzleLoader";
import type { StickeringMask } from "../../../puzzles/stickerings/mask";
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
import type { KPuzzle } from "../../../kpuzzle";
import { KPuzzleSVGWrapper } from "./KPuzzleSVGWrapper";

export interface Twisty2DPuzzleOptions {
  experimentalStickering?: ExperimentalStickering;
}

// <twisty-2d-svg>
export class Twisty2DPuzzle
  extends ManagedCustomElement
  implements PositionListener
{
  public svgWrapper: KPuzzleSVGWrapper;
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

    this.#freshListenerManager.addListener(this.model!.puzzleID, (
      puzzleID: PuzzleID,
    ) => {
      if (puzzleLoader?.id !== puzzleID) {
        this.disconnect();
      }
    });

    this.#freshListenerManager.addListener(
      this.model!.legacyPosition,
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

        let partialMove = move;
        if (position.movesInProgress[0].direction === Direction.Backwards) {
          partialMove = move.invert();
        }
        const newState = position.state.applyMove(partialMove);
        // TODO: move to render()
        this.svgWrapper.draw(
          position.state,
          newState,
          position.movesInProgress[0].fraction,
        );
      } else {
        this.svgWrapper.draw(position.state);
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
  private resetSVG(appearance?: StickeringMask): void {
    if (this.svgWrapper) {
      this.removeElement(this.svgWrapper.wrapperElement);
    }
    if (!this.kpuzzle) {
      return; // TODO
    }
    this.svgWrapper = new KPuzzleSVGWrapper(
      this.kpuzzle,
      this.svgSource!,
      appearance,
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
