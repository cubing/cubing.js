import type { ExperimentalStickering } from "../../../twisty";
import { puzzles } from "../../../puzzles";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";
import type { PuzzlePosition } from "../../old/animation/cursor/CursorTypes";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { proxy3D } from "../../heavy-code-imports/3d";
import type { Cube3D, PG3D } from "../../heavy-code-imports/dynamic-entries/3d";
import type { HintFaceletStyleWithAuto } from "../../model/depth-0/HintFaceletProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { TwistyPropParent } from "../../model/TwistyProp";
import type { PG3DV2 } from "./puzzles/PG3DV2";

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

    addListener(
      this.model.legacyPositionProp,
      async (position: PuzzlePosition) => {
        if (disconnected) {
          // TODO: Why does this still fire?
          console.log(new Error("We should be disconnected!"));
          return;
        }
        (await this.twisty3DPuzzle()).onPositionChange(position);
        this.scheduleRender();
      },
    );

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
        if ("experimentalUpdatePG3DOptions" in (await this.twisty3DPuzzle())) {
          (
            (await this.twisty3DPuzzle()) as PG3DV2
          ).experimentalUpdatePG3DOptions({
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
      const proxyPromise = proxy3D();
      switch (this.puzzleID) {
        case "3x3x3":
          return (await proxyPromise).cube3DShim();
        default:
          const hintFacelets = await this.model!.hintFaceletProp.get();
          if ((await this.model.visualizationStrategyProp.get()) === "PG3DV2") {
            return (await proxyPromise).pg3dv2Shim(
              this.puzzleID,
              hintFacelets === "auto" ? "floating" : hintFacelets,
            );
          }
          return (await proxyPromise).pg3dShim(
            this.puzzleID,
            hintFacelets === "auto" ? "floating" : hintFacelets,
          );
      }
    })());
  }
}
