import { puzzles } from "../../../puzzles";
import type { ExperimentalStickering } from "../../../twisty";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/TwistyProp";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { Twisty2DPuzzle } from "./Twisty2DPuzzle";

export class Twisty2DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleID: PuzzleID,
    private effectiveVisualization: "2D" | "experimental-2D-LL",
  ) {
    this.twisty2DPuzzle(); // Start constructing.

    this.#freshListenerManager.addListener(
      this.model.stickeringProp,
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
      console.log("fdfdf", this.effectiveVisualization);
      const svgPromise =
        this.effectiveVisualization === "experimental-2D-LL"
          ? puzzles[this.puzzleID].llSVG!()
          : puzzles[this.puzzleID].svg();
      return new Twisty2DPuzzle(
        this.model,
        await puzzles[this.puzzleID].def(),
        await svgPromise,
        {},
        puzzles[this.puzzleID],
      );
    })());
  }
}
