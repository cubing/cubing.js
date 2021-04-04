import { ExperimentalStickering } from "../../twisty";
import { PuzzleLoader } from "../PuzzleLoader";
import { PuzzleAppearance } from "./appearance";
import { cubeAppearance } from "./cube-stickerings";

// TODO: cache calculations?
export async function megaminxAppearance(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<PuzzleAppearance> {
  switch (stickering) {
    case "full":
    case "F2L":
    case "LL":
      return cubeAppearance(puzzleLoader, stickering);
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`,
      );
  }
  return cubeAppearance(puzzleLoader, "full");
}

export async function megaminxStickerings(): Promise<ExperimentalStickering[]> {
  return ["full", "F2L", "LL"];
}
