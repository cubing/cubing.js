import type { Raycaster, Texture as ThreeTexture } from "three/src/Three.js";
import type { PuzzleLoader } from "../../../puzzles";
import type { ExperimentalStickeringMask } from "../../../puzzles/cubing-private";
import type { PuzzlePosition } from "../../controllers/AnimationTypes";
import type { Schedulable } from "../../controllers/RenderScheduler";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import type { FoundationDisplay } from "../../model/props/puzzle/display/FoundationDisplayProp";
import type { HintFaceletStyleWithAuto } from "../../model/props/puzzle/display/HintFaceletProp";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { VisualizationStrategy } from "../../model/props/viewer/VisualizationStrategyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { Cube3D } from "./puzzles/Cube3D";
import type { PG3D } from "./puzzles/PG3D";
import type { Twisty3DPuzzle } from "./puzzles/Twisty3DPuzzle";

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
      this.model.twistySceneModel.hintFacelet,
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
      this.model.twistySceneModel.foundationDisplay,
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
      this.model.twistySceneModel.stickeringMask,
      async (stickeringMask: ExperimentalStickeringMask) => {
        const twisty3D = await this.twisty3DPuzzle();
        twisty3D.setStickeringMask(stickeringMask);
        this.scheduleRender();
      },
    );
    this.#freshListenerManager.addListener(
      this.model.twistySceneModel.faceletScale,
      async (faceletScale: "auto" | number) => {
        (
          (await this.twisty3DPuzzle()) as Cube3D | PG3D
        ).experimentalUpdateOptions({
          faceletScale,
        });
        this.scheduleRender();
      },
    );

    this.#freshListenerManager.addMultiListener3(
      [
        this.model.twistySceneModel.stickeringMask,
        this.model.twistySceneModel.foundationStickerSprite,
        this.model.twistySceneModel.hintStickerSprite,
      ],
      async (
        inputs: [
          stickeringMask: ExperimentalStickeringMask,
          foundationSprite: ThreeTexture | null,
          hintSprite: ThreeTexture | null,
        ],
      ) => {
        if ("experimentalUpdateTexture" in (await this.twisty3DPuzzle())) {
          ((await this.twisty3DPuzzle()) as PG3D).experimentalUpdateTexture(
            inputs[0].specialBehaviour === "picture",
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
      const proxyPromise = bulk3DCode();
      if (
        this.puzzleLoader.id === "3x3x3" &&
        this.visualizationStrategy === "Cube3D"
      ) {
        // TODO: synchronize
        const [
          foundationSprite,
          hintSprite,
          experimentalStickeringMask,
          initialHintFaceletsAnimation,
        ] = await Promise.all([
          this.model.twistySceneModel.foundationStickerSprite.get(),
          this.model.twistySceneModel.hintStickerSprite.get(),
          this.model.twistySceneModel.stickeringMask.get(),
          this.model.twistySceneModel.initialHintFaceletsAnimation.get(),
        ]);
        return (await proxyPromise).cube3DShim(
          () => this.schedulable.scheduleRender(),
          {
            foundationSprite,
            hintSprite,
            experimentalStickeringMask,
            initialHintFaceletsAnimation,
          },
        );
      } else {
        const [hintFacelets, foundationSprite, hintSprite, faceletScale] =
          await Promise.all([
            this.model.twistySceneModel.hintFacelet.get(),
            this.model.twistySceneModel.foundationStickerSprite.get(),
            this.model.twistySceneModel.hintStickerSprite.get(),
            this.model.twistySceneModel.faceletScale.get(),
          ]);
        const pg3d = (await proxyPromise).pg3dShim(
          () => this.schedulable.scheduleRender(),
          this.puzzleLoader,
          hintFacelets === "auto" ? "floating" : hintFacelets,
          faceletScale,
          this.puzzleLoader.id === "kilominx", // TODO: generalize to other puzzles
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
