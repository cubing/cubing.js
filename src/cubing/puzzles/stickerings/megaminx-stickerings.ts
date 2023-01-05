import type { ExperimentalStickering } from "../../twisty";
import type { PuzzleLoader } from "../PuzzleLoader";
import type { StickeringMask } from "./mask";
import {
  cubeLikeStickeringList,
  cubeLikeStickeringMask,
} from "./cube-like-stickerings";
import { from } from "../../vendor/mit/p-lazy/p-lazy";

// TODO: cache calculations?
export async function megaminxStickeringMask(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<StickeringMask> {
  // TODO: optimize lookup instead of looking through a list
  if ((await megaminxStickerings()).includes(stickering)) {
    return cubeLikeStickeringMask(puzzleLoader, stickering);
  }
  console.warn(
    `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`,
  );
  return cubeLikeStickeringMask(puzzleLoader, "full");
}

const megaminxStickeringListPromise: Promise<string[]> = from(() =>
  cubeLikeStickeringList("megaminx"),
);
export function megaminxStickerings(): Promise<string[]> {
  return megaminxStickeringListPromise;
}
