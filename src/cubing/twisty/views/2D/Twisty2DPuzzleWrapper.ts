import type { PuzzleLoader } from "../../../puzzles";
import type { ExperimentalStickeringMask } from "../../../puzzles/cubing-private";
import type { Schedulable } from "../../controllers/RenderScheduler";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { Twisty2DPuzzle } from "./Twisty2DPuzzle";

export class Twisty2DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleLoader: PuzzleLoader,
    private effectiveVisualization:
      | "2D"
      | "experimental-2D-LL"
      | "experimental-2D-LL-face",
  ) {
    this.twisty2DPuzzle(); // Start constructing.

    this.#freshListenerManager.addListener(
      this.model.twistySceneModel.stickeringMask,
      async (stickeringMask: ExperimentalStickeringMask) => {
        (await this.twisty2DPuzzle()).experimentalSetStickeringMask(
          stickeringMask,
        );
      },
    );
  }

  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
  }

  // TODO: Hook this up nicely.
  scheduleRender(): void {
    // Nothing
  }

  #cachedTwisty2DPuzzle: Promise<Twisty2DPuzzle> | null = null;
  // TODO: Stale dropper?
  async twisty2DPuzzle(): Promise<Twisty2DPuzzle> {
    return (this.#cachedTwisty2DPuzzle ??= (async () => {
      const svgPromise =
        this.effectiveVisualization === "experimental-2D-LL-face"
          ? this.puzzleLoader.llFaceSVG!()
          : this.effectiveVisualization === "experimental-2D-LL"
            ? this.puzzleLoader.llSVG!()
            : this.puzzleLoader.svg();
      return new Twisty2DPuzzle(
        this.model,
        await this.puzzleLoader.kpuzzle(),
        await svgPromise,
        {},
        this.puzzleLoader,
      );
    })());
  }
}
