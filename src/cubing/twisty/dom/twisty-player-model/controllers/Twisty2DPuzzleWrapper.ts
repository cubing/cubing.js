import type { ExperimentalStickering } from "../../..";
import { puzzles } from "../../../../puzzles";
import type { PuzzlePosition } from "../../../animation/cursor/CursorTypes";
import type { Schedulable } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import type { TwistyPropParent } from "../props/TwistyProp";
import { Twisty2DPuzzle } from "./Twisty2DPuzzle";

export class Twisty2DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleID: PuzzleID,
  ) {
    this.twisty2DPuzzle(); // Start constructing.

    let disconnected = false;
    // TODO: Hook up listeners before loading the heavy code in the async constructor, so we get any intermediate updates?
    // Repro: Switch to 40x40x40 a fraction of a second before animation finishes. When it's loaded the itmeline is at the end, but the 40x40x40 is rendered with an earlier position.
    const addListener = <T>(
      prop: TwistyPropParent<T>,
      listener: (value: T) => void,
    ) => {
      prop.addFreshListener(listener);
      this.#disconnectionFunctions.push(() => {
        prop.removeFreshListener(listener);
        disconnected = true;
      });
    };

    addListener(this.model.positionProp, async (position: PuzzlePosition) => {
      if (disconnected) {
        // TODO: Why does this still fire?
        console.log(new Error("We should be disconnected!"));
        return;
      }
      (await this.twisty2DPuzzle()).onPositionChange(position);
      this.scheduleRender();
    });

    addListener(
      this.model.stickeringProp,
      async (stickering: ExperimentalStickering) => {
        if (disconnected) {
          // TODO: Why does this still fire?
          console.log(new Error("We should be disconnected!"));
          return;
        }
        (await this.twisty2DPuzzle()).experimentalSetStickering(stickering);
      },
    );
  }

  #disconnectionFunctions: (() => void)[] = [];
  disconnect(): void {
    for (const fn of this.#disconnectionFunctions) {
      fn();
    }
    this.#disconnectionFunctions = []; // TODO: Encapsulate this.
  }

  // TODO: Hook this up nicely.
  scheduleRender(): void {
    // Nothing
  }

  #cachedTwisty2DPuzzle: Promise<Twisty2DPuzzle> | null = null;
  // TODO: Stale dropper?
  async twisty2DPuzzle(): Promise<Twisty2DPuzzle> {
    return (this.#cachedTwisty2DPuzzle ??= (async () => {
      return new Twisty2DPuzzle(
        this.model,
        await puzzles[this.puzzleID].def(),
        await puzzles[this.puzzleID].svg(),
        {},
        puzzles[this.puzzleID],
      );
    })());
  }
}
