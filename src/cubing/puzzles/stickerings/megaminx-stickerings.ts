import type { ExperimentalStickering } from "../../twisty";
import type { PuzzleLoader } from "../PuzzleLoader";
import type { StickeringMask } from "./mask";
import { cubeAppearance } from "./cube-stickerings";

// TODO: cache calculations?
export async function megaminxAppearance(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<StickeringMask> {
  switch (stickering) {
    case "full":
    case "F2L":
    case "LL":
    case "OLL":
    case "PLL":
    case "ELS":
    case "CLS":
      return cubeAppearance(puzzleLoader, stickering);
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`,
      );
  }
  return cubeAppearance(puzzleLoader, "full");
}

export async function megaminxStickerings(): Promise<ExperimentalStickering[]> {
  return ["full", "F2L", "LL", "OLL", "PLL", "ELS", "CLS"];
}
