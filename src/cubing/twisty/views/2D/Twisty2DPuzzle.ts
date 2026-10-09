import type { KPuzzle } from "../../../kpuzzle/index.ts";
import type { ExperimentalStickeringMask } from "../../../puzzles/cubing-private/index.ts";
import type { PuzzleLoader } from "../../../puzzles/PuzzleLoader.ts";
import type { StickeringMask } from "../../../puzzles/stickerings/mask.ts";
import {
  type HintFaceletStyleWithAuto,
  hintFaceletStyles,
} from "../../../twisty/model/props/puzzle/display/HintFaceletProp.ts";
import {
  Direction,
  type PositionListener,
  type PuzzlePosition,
} from "../../controllers/AnimationTypes.ts";
import { RenderScheduler } from "../../controllers/RenderScheduler.ts";
import type { PuzzleID } from "../../index.ts";
import { FreshListenerManager } from "../../model/props/TwistyProp.ts";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel.ts";
import { ClassListManager } from "../ClassListManager.ts";
import { ManagedCustomElement } from "../ManagedCustomElement.ts";
import { customElementsShim } from "../node-custom-element-shims.ts";
import { twisty2DSVGCSS } from "./Twisty2DPuzzle.css.ts";
import { TwistyAnimatedSVG } from "./TwistyAnimatedSVG.ts";

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

  private model?: TwistyPlayerModel;
  private kpuzzle?: KPuzzle;
  private svgSource?: string;
  private options?: Twisty2DPuzzleOptions;
  private puzzleLoader?: PuzzleLoader;

  constructor(
    model?: TwistyPlayerModel,
    kpuzzle?: KPuzzle,
    svgSource?: string,
    options?: Twisty2DPuzzleOptions,
    puzzleLoader?: PuzzleLoader,
  ) {
    super();
    this.model = model;
    this.kpuzzle = kpuzzle;
    this.svgSource = svgSource;
    this.options = options;

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
      this.model!.twistySceneModel.hintFacelet,
      (hintFacelet) => {
        this.setHintFacelet(hintFacelet);
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

  private hintFaceletsClassListManager = new ClassListManager(
    this,
    "hint-facelets-",
    Object.keys(hintFaceletStyles),
  );
  setHintFacelet(hintFacelet: HintFaceletStyleWithAuto) {
    this.hintFaceletsClassListManager.setValue(
      hintFacelet === "auto" ? "floating" : hintFacelet,
    );
  }

  private render(): void {
    /*...*/
  }
}

customElementsShim.define("twisty-2d-puzzle", Twisty2DPuzzle);
