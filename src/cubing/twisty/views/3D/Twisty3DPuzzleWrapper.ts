import type { Raycaster, Texture as ThreeTexture } from "three";
import { experimentalCubeAppearance, PuzzleLoader } from "../../../puzzles";
import type { ExperimentalStickering } from "../../../twisty";
import { proxy3D } from "../../heavy-code-imports/3d";
import type { FoundationDisplay } from "../../model/props/puzzle/display/FoundationDisplayProp";
import type { HintFaceletStyleWithAuto } from "../../model/props/puzzle/display/HintFaceletProp";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { VisualizationStrategy } from "../../model/props/viewer/VisualizationStrategyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { PuzzlePosition } from "../../controllers/AnimationTypes";
import type { Schedulable } from "../../controllers/RenderScheduler";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";
import type { Cube3D } from "./puzzles/Cube3D";
import type { PG3D } from "./puzzles/PG3D";

export class Twisty3DPuzzleWrapper implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleLoader: PuzzleLoader,
    private visualizationStrategy: VisualizationStrategy,
  ) {
    this.twisty3DPuzzle(); // Start constructing.

    // TODO: Hook up listeners before loading the heavy code in the async constructor, so we get any intermediate updates?
    // Repro: Switch to 40x40x40 a fraction of a second before animation finishes. When it's loaded the itmeline is at the end, but the 40x40x40 is rendered with an earlier position.

    this.#freshListenerManager.addListener(
      this.model.puzzleLoader,
      (puzzleLoader: PuzzleLoader) => {
        if (this.puzzleLoader.id !== puzzleLoader.id) {
          this.disconnect();
        }
      },
    );
    this.#freshListenerManager.addListener(
      this.model.legacyPosition,
      async (position: PuzzlePosition) => {
        try {
          (await this.twisty3DPuzzle()).onPositionChange(position);
          this.scheduleRender();
        } catch (e) {
          // TODO
          // console.warn(
          //   "Bad position (this doesn't necessarily mean something is wrong). Pre-emptively disconnecting:",
          //   this.puzzleLoader.id,
          //   e,
          // );
          this.disconnect();
        }
      },
    );

    this.#freshListenerManager.addListener(
      this.model.twistyViewerModel.hintFacelet,
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
      this.model.twistyViewerModel.foundationDisplay,
      async (foundationDisplay: FoundationDisplay) => {
        (
          (await this.twisty3DPuzzle()) as Cube3D | PG3D
        ).experimentalUpdateOptions({
          showFoundation: foundationDisplay !== "none",
        });
        this.scheduleRender();
      },
    );
    this.#freshListenerManager.addListener(
      this.model.twistyViewerModel.stickering,
      async (stickering: ExperimentalStickering) => {
        if ("setStickering" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as Cube3D).setStickering(stickering);
          this.scheduleRender();
        } else {
          if (
            [
              "experimental-global-custom-1",
              "experimental-global-custom-2",
            ].includes(stickering)
          ) {
            const [twisty3D] = await Promise.all([this.twisty3DPuzzle()]);
            (twisty3D as PG3D).experimentalSetAppearance(
              await experimentalCubeAppearance(this.puzzleLoader, stickering),
            );
            this.scheduleRender();
            return;
          }

          // TODO: create a prop to handle this.
          if ("appearance" in this.puzzleLoader) {
            const [twisty3D, appearancePromise] = await Promise.all([
              this.twisty3DPuzzle(),
              this.puzzleLoader.appearance!(stickering ?? "full"),
            ]);
            (twisty3D as PG3D).experimentalSetAppearance(appearancePromise);
            this.scheduleRender();
          }
        }
      },
    );

    this.#freshListenerManager.addMultiListener(
      [
        this.model.twistyViewerModel.foundationStickerSprite,
        this.model.twistyViewerModel.hintStickerSprite,
      ],
      async (
        inputs: [
          foundationSprite: ThreeTexture | null,
          hintSprite: ThreeTexture | null,
        ],
      ) => {
        if ("experimentalUpdateTexture" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as PG3D).experimentalUpdateTexture(
            true,
            ...inputs,
          );
          this.scheduleRender();
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
        this.puzzleLoader.id === "3x3x3" &&
        this.visualizationStrategy === "Cube3D"
      ) {
        // TODO: synchronize
        const [foundationSprite, hintSprite, experimentalStickering] =
          await Promise.all([
            this.model.twistyViewerModel.foundationStickerSprite.get(),
            this.model.twistyViewerModel.hintStickerSprite.get(),
            this.model.twistyViewerModel.stickering.get(),
          ]);
        return (await proxyPromise).cube3DShim({
          foundationSprite,
          hintSprite,
          experimentalStickering,
        });
      } else {
        const [hintFacelets, foundationSprite, hintSprite] = await Promise.all([
          this.model.twistyViewerModel.hintFacelet.get(),
          this.model.twistyViewerModel.foundationStickerSprite.get(),
          this.model.twistyViewerModel.hintStickerSprite.get(),
        ]);
        const pg3d = (await proxyPromise).pg3dShim(
          this.puzzleLoader,
          hintFacelets === "auto" ? "floating" : hintFacelets,
        );
        // TODO: Figure out how to do this in one place using the listener.
        pg3d.then((p) =>
          p.experimentalUpdateTexture(
            true,
            foundationSprite ?? undefined,
            hintSprite ?? undefined,
          ),
        );
        return pg3d;
      }
    })());
  }

  async raycastMove(
    raycasterPromise: Promise<Raycaster>,
    transformations: {
      invert: boolean;
      depth?: "secondSlice" | "rotation" | "none";
    },
  ): Promise<void> {
    const puzzle = (await this.twisty3DPuzzle()) as Cube3D | PG3D;
    // TODO: check this differently.
    if (!("experimentalGetControlTargets" in puzzle)) {
      console.info("not PG3D! skipping raycast");
      return;
    }

    const targets = puzzle.experimentalGetControlTargets(); // TODO: sticker targets
    const [raycaster] = await Promise.all([raycasterPromise]);

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const closestMove = puzzle.getClosestMoveToAxis(
        intersects[0].point,
        transformations,
      );
      if (closestMove) {
        this.model.experimentalAddMove(closestMove.move, {
          coalesce: true,
          mod: closestMove.order,
        });
      } else {
        console.info("Skipping move!");
      }
    }
  }
}
