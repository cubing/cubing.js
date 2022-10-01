import type { Raycaster, Texture as ThreeTexture } from "three";
import type { PuzzleLoader } from "../../../puzzles";
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
import { Cube3D } from "./puzzles/Cube3D";
import type { PG3D } from "./puzzles/PG3D";
import type { ExperimentalStickeringMask } from "../../../puzzles/cubing-private";

export class Twisty3DPuzzleWrapper extends EventTarget implements Schedulable {
  constructor(
    private model: TwistyPlayerModel,
    public schedulable: Schedulable,
    private puzzleLoader: PuzzleLoader,
    private visualizationStrategy: VisualizationStrategy,
  ) {
    super();
    this.twisty3DPuzzle(); // Start constructing.

    // TODO: Hook up listeners before loading the heavy code in the async constructor, so we get any intermediate updates?
    // Repro: Switch to 40x40x40 a fraction of a second before animation finishes. When it's loaded the itmeline is at the end, but the 40x40x40 is rendered with an earlier position.

    this.#freshListenerManager.addListener(this.model.puzzleLoader, (
      puzzleLoader: PuzzleLoader,
    ) => {
      if (this.puzzleLoader.id !== puzzleLoader.id) {
        this.disconnect();
      }
    });
    this.#freshListenerManager.addListener(this.model.legacyPosition, async (
      position: PuzzlePosition,
    ) => {
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
    });

    this.#freshListenerManager.addListener(this.model.twistySceneModel
      .hintFacelet, async (hintFaceletStyle: HintFaceletStyleWithAuto) => {
      (
        (await this.twisty3DPuzzle()) as Cube3D | PG3D
      ).experimentalUpdateOptions({
        hintFacelets:
          hintFaceletStyle === "auto" ? "floating" : hintFaceletStyle,
      });
      this.scheduleRender();
    });
    this.#freshListenerManager.addListener(this.model.twistySceneModel
      .foundationDisplay, async (foundationDisplay: FoundationDisplay) => {
      (
        (await this.twisty3DPuzzle()) as Cube3D | PG3D
      ).experimentalUpdateOptions({
        showFoundation: foundationDisplay !== "none",
      });
      this.scheduleRender();
    });
    this.#freshListenerManager.addListener(this.model.twistySceneModel
      .stickeringMask, async (appearance: ExperimentalStickeringMask) => {
      const twisty3D = await this.twisty3DPuzzle();
      if (twisty3D instanceof Cube3D) {
        twisty3D.setAppearance(appearance);
      } else {
        (twisty3D as PG3D).experimentalSetAppearance(appearance);
      }
      this.scheduleRender();
    });
    this.#freshListenerManager.addListener(this.model.twistySceneModel
      .stickering, async (stickering: ExperimentalStickering) => {
      if ("setStickering" in (await this.twisty3DPuzzle())) {
        ((await this.twisty3DPuzzle()) as Cube3D).setStickering(stickering);
        this.scheduleRender();
      } else {
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
    });

    this.#freshListenerManager.addMultiListener3(
      [
        this.model.twistySceneModel.stickering,
        this.model.twistySceneModel.foundationStickerSprite,
        this.model.twistySceneModel.hintStickerSprite,
      ],
      async (
        inputs: [
          stickering: ExperimentalStickering,
          foundationSprite: ThreeTexture | null,
          hintSprite: ThreeTexture | null,
        ],
      ) => {
        if ("experimentalUpdateTexture" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as PG3D).experimentalUpdateTexture(
            inputs[0] === "picture",
            inputs[1],
            inputs[2],
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
    this.dispatchEvent(new CustomEvent("render-scheduled"));
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
            this.model.twistySceneModel.foundationStickerSprite.get(),
            this.model.twistySceneModel.hintStickerSprite.get(),
            this.model.twistySceneModel.stickering.get(),
          ]);
        return (await proxyPromise).cube3DShim(() =>
          this.schedulable.scheduleRender(), {
          foundationSprite,
          hintSprite,
          experimentalStickering,
        });
      } else {
        const [hintFacelets, foundationSprite, hintSprite] = await Promise.all([
          this.model.twistySceneModel.hintFacelet.get(),
          this.model.twistySceneModel.foundationStickerSprite.get(),
          this.model.twistySceneModel.hintStickerSprite.get(),
        ]);
        const pg3d = (await proxyPromise).pg3dShim(
          () => this.schedulable.scheduleRender(),
          this.puzzleLoader,
          hintFacelets === "auto" ? "floating" : hintFacelets,
        );
        // TODO: Figure out how to do this in one place using the listener.
        pg3d.then(
          (p) =>
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
    const [raycaster, movePressCancelOptions] = await Promise.all([
      raycasterPromise,
      this.model.twistySceneModel.movePressCancelOptions.get(),
    ]);

    const intersects = raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const closestMove = puzzle.getClosestMoveToAxis(
        intersects[0].point,
        transformations,
      );
      if (closestMove) {
        this.model.experimentalAddMove(closestMove.move, {
          cancel: movePressCancelOptions,
        });
      } else {
        console.info("Skipping move!");
      }
    }
  }
}
