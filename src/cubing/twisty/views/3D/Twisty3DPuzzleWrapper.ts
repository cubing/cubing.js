import { puzzles } from "../../../puzzles";
import type { ExperimentalStickering } from "../../../twisty";
import { proxy3D } from "../../heavy-code-imports/3d";
import type { Cube3D, PG3D } from "../../heavy-code-imports/dynamic-entries/3d";
import type { HintFaceletStyleWithAuto } from "../../model/depth-0/HintFaceletProp";
import type { VisualizationStrategy } from "../../model/depth-1/VisualizationStrategyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/TwistyProp";
import type { PuzzlePosition } from "../../old/animation/cursor/CursorTypes";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";

export class Twisty3DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleID: PuzzleID,
    private visualizationStrategy: VisualizationStrategy,
  ) {
    this.twisty3DPuzzle(); // Start constructing.

    // TODO: Hook up listeners before loading the heavy code in the async constructor, so we get any intermediate updates?
    // Repro: Switch to 40x40x40 a fraction of a second before animation finishes. When it's loaded the itmeline is at the end, but the 40x40x40 is rendered with an earlier position.

    this.#freshListenerManager.addListener(
      this.model!.puzzleProp,
      (puzzleID: PuzzleID) => {
        if (this.puzzleID !== puzzleID) {
          this.disconnect();
        }
      },
    );
    this.#freshListenerManager.addListener(
      this.model.legacyPositionProp,
      async (position: PuzzlePosition) => {
        try {
          (await this.twisty3DPuzzle()).onPositionChange(position);
          this.scheduleRender();
        } catch (e) {
          console.warn(
            "Bad position. Pre-emptively disconnecting:",
            this.puzzleID,
            e,
          );
          this.disconnect();
        }
      },
    );

    this.#freshListenerManager.addListener(
      this.model.hintFaceletProp,
      async (hintFaceletStyle: HintFaceletStyleWithAuto) => {
        (
          (await this.twisty3DPuzzle()) as Cube3D | PG3D
        ).experimentalUpdateOptions({
          hintFacelets:
            hintFaceletStyle === "auto" ? "floating" : hintFaceletStyle,
        });
        this.scheduleRender();
      },
    );
    this.#freshListenerManager.addListener(
      this.model.stickeringProp,
      async (stickering: ExperimentalStickering) => {
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

  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
  }

  scheduleRender(): void {
    this.schedulable.scheduleRender();
  }

  #cachedTwisty3DPuzzle: Promise<Twisty3DPuzzle> | null = null;
  async twisty3DPuzzle(): Promise<Twisty3DPuzzle> {
    return (this.#cachedTwisty3DPuzzle ??= (async () => {
      const proxyPromise = proxy3D();
      if (
        this.puzzleID === "3x3x3" &&
        this.visualizationStrategy === "Cube3D"
      ) {
        // TODO: synchronize
        const [foundationSprite, hintSprite, experimentalStickering] = await Promise.all([
          this.model.foundationStickerSprite.get(),
          this.model.hintStickerSprite.get(),
          this.model.stickeringProp.get()
        ]);
        console.log([foundationSprite, hintSprite]);
        return (await proxyPromise).cube3DShim({
          foundationSprite,
          hintSprite,
          experimentalStickering
        });
      } else {
        const hintFacelets = await this.model!.hintFaceletProp.get();
        return (await proxyPromise).pg3dShim(
          this.puzzleID,
          hintFacelets === "auto" ? "floating" : hintFacelets,
        );
      }
    })());
  }
}
