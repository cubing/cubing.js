import type { ExperimentalStickering } from "../../..";
import { puzzles } from "../../../../puzzles";
import type { Twisty3DPuzzle } from "../../../3D/puzzles/Twisty3DPuzzle";
import type { PuzzlePosition } from "../../../animation/cursor/CursorTypes";
import type { Schedulable } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { proxy3D } from "../heavy-code-imports/3d";
import type { Cube3D, PG3D } from "../heavy-code-imports/dynamic-entries/3d";
import type { HintFaceletStyleWithAuto } from "../props/depth-1/HintFaceletProp";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import type { TwistyPropParent } from "../props/TwistyProp";

export class Twisty3DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleID: PuzzleID,
  ) {
    this.twisty3DPuzzle(); // Start constructing.

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
      (await this.twisty3DPuzzle()).onPositionChange(position);
      this.scheduleRender();
    });

    addListener(
      this.model.hintFaceletProp,
      async (hintFaceletStyle: HintFaceletStyleWithAuto) => {
        if (disconnected) {
          // TODO: Why does this still fire?
          console.log(new Error("We should be disconnected!"));
          return;
        }
        if ("experimentalUpdateOptions" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as Cube3D).experimentalUpdateOptions({
            hintFacelets:
              hintFaceletStyle === "auto" ? "floating" : hintFaceletStyle,
          });
          this.scheduleRender();
        }
      },
    );
    addListener(
      this.model.stickeringProp,
      async (stickering: ExperimentalStickering) => {
        if (disconnected) {
          // TODO: Why does this still fire?
          console.log(new Error("We should be disconnected!"));
          return;
        }
        console.log("stickering", stickering);
        if ("setStickering" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as Cube3D).setStickering(stickering);
          this.scheduleRender();
        } else {
          // TODO: create a prop to handle this.
          if ("appearance" in puzzles[puzzleID]!) {
            const [twisty3D, appearancePromise] = await Promise.all([
              this.twisty3DPuzzle(),
              puzzles[puzzleID]!.appearance!(stickering ?? "full"),
            ]);
            (twisty3D as PG3D).experimentalSetAppearance(appearancePromise);
            this.scheduleRender();
          }
        }
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

  scheduleRender(): void {
    this.schedulable.scheduleRender();
  }

  #cachedTwisty3DPuzzle: Promise<Twisty3DPuzzle> | null = null;
  async twisty3DPuzzle(): Promise<Twisty3DPuzzle> {
    return (this.#cachedTwisty3DPuzzle ??= (async () => {
      const proxy = await proxy3D();
      switch (this.puzzleID) {
        case "3x3x3":
          return proxy.cube3DShim();
        default:
          return proxy.pg3dShim(this.puzzleID);
      }
    })());
  }
}
