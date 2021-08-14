import type { ExperimentalStickering } from "../../..";
import type { Twisty3DPuzzle } from "../../../3D/puzzles/Twisty3DPuzzle";
import type { PuzzlePosition } from "../../../animation/cursor/CursorTypes";
import type { Schedulable } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { proxy3D } from "../heavy-code-imports/3d";
import type { Cube3D } from "../heavy-code-imports/dynamic-entries/3d";
import type { HintFaceletStyleWithAuto } from "../props/depth-1/HintFaceletProp";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import type { TwistyPropParent } from "../props/TwistyProp";

export class Twisty3DPuzzleWrapper implements Schedulable {
  private constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    public twisty3D: Twisty3DPuzzle,
  ) {
    let disconnected = false;
    const addListener = <T>(
      prop: TwistyPropParent<T>,
      listener: (value: T) => void,
    ) => {
      prop.addFreshListener(listener);
      this.#disconnectionFunctions.push(() => {
        console.log("disconnecting", prop, listener);
        prop.removeFreshListener(listener);
        disconnected = true;
      });
    };

    addListener(this.model.positionProp, async (position: PuzzlePosition) => {
      if (disconnected) {
        console.log("disconnnencnteerje?!?");
        // TODO: wait what?
        return;
      }
      twisty3D.onPositionChange(position);
      this.scheduleRender();
    });

    addListener(
      this.model.hintFaceletProp,
      async (hintFaceletStyle: HintFaceletStyleWithAuto) => {
        if (disconnected) {
          console.log("disconnnencnteerje?!?");
          // TODO: wait what?
          return;
        }
        if ("experimentalUpdateOptions" in twisty3D) {
          (twisty3D as Cube3D).experimentalUpdateOptions({
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
          console.log("disconnnencnteerje?!?");
          // TODO: wait what?
          return;
        }
        if ("setStickering" in twisty3D) {
          (twisty3D as Cube3D).setStickering(stickering);
          this.scheduleRender();
        } else {
          // TODO: create a prop to handle this.
          console.error("Still need to connect PG3D appearance.");
        }
      },
    );
  }

  #disconnectionFunctions: (() => void)[] = [];
  disconnect(): void {
    for (const fn of this.#disconnectionFunctions) {
      fn();
    }
  }

  scheduleRender(): void {
    this.schedulable.scheduleRender();
  }

  static async fromPuzzleID(
    model: TwistyPlayerModel,
    schedulable: Schedulable,
    puzzleID: PuzzleID,
  ): Promise<Twisty3DPuzzleWrapper> {
    const proxy = await proxy3D();
    switch (puzzleID) {
      case "3x3x3":
        return new Twisty3DPuzzleWrapper(
          model,
          schedulable,
          await proxy.cube3DShim(),
        );
      default: {
        return new Twisty3DPuzzleWrapper(
          model,
          schedulable,
          await proxy.pg3dShim(puzzleID),
        );
      }
    }
  }
}
