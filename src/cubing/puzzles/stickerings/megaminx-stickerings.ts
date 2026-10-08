import { LazyPromise } from "@cubing/lazy-promise";
import type { ExperimentalStickering } from "../../twisty/index.ts";
import type { PuzzleLoader } from "../PuzzleLoader.ts";
import {
  cubeLikeStickeringList,
  cubeLikeStickeringMask,
} from "./cube-like-stickerings.ts";
import type { StickeringMask } from "./mask.ts";

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

const megaminxStickeringListPromise: Promise<string[]> = new LazyPromise(() =>
  cubeLikeStickeringList("megaminx"),
);
export function megaminxStickerings(): Promise<string[]> {
  return megaminxStickeringListPromise;
}
