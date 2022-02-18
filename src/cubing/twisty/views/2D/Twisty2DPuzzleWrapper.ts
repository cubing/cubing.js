import type { PuzzleLoader } from "../../../puzzles";
import type { ExperimentalStickering } from "../../../twisty";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { Schedulable } from "../../controllers/RenderScheduler";
import { Twisty2DPuzzle } from "./Twisty2DPuzzle";

export class Twisty2DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleLoader: PuzzleLoader,
    private effectiveVisualization: "2D" | "experimental-2D-LL",
  ) {
    this.twisty2DPuzzle(); // Start constructing.

    this.#freshListenerManager.addListener(
      this.model.twistyViewerModel.stickering,
      async (stickering: ExperimentalStickering) => {
        (await this.twisty2DPuzzle()).experimentalSetStickering(stickering);
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
        this.effectiveVisualization === "experimental-2D-LL"
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
