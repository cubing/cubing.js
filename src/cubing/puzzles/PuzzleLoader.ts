import type { AlgLeaf, PuzzleSpecificSimplifyOptions } from "../alg";
import type { AppendOptions } from "../alg/simplify";
import type { KPuzzle } from "../kpuzzle";
import type { PuzzleGeometry } from "../puzzle-geometry";
import type { ExperimentalStickering } from "../twisty";
import type { StickeringMask } from "./stickerings/mask";

export type KeyMapping = { [keyCode: string]: AlgLeaf };

export interface PuzzleLoader {
  id: string;
  // shortName?: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number; // TODO: date?
  /** @deprecated */
  def?: never;
  kpuzzle: () => Promise<KPuzzle>; // TODO
  svg: () => Promise<string>;
  llSVG?: () => Promise<string>;
  llFaceSVG?: () => Promise<string>;
  pg?: () => Promise<PuzzleGeometry>;
  stickeringMask?: (
    stickering: ExperimentalStickering,
  ) => Promise<StickeringMask>;
  stickerings?: () => Promise<ExperimentalStickering[]>;
  puzzleSpecificSimplifyOptions?: PuzzleSpecificSimplifyOptions;
  puzzleSpecificSimplifyOptionsPromise?: Promise<PuzzleSpecificSimplifyOptions>; // TODO
  keyMapping?: () => Promise<KeyMapping>; // TODO: async getter
}

// TODO: consolidate the `puzzleSpecificSimplifyOptionsPromise` with `puzzleSpecificSimplifyOptions` somehow, so that we don't have to do this.
export async function getPartialAppendOptionsForPuzzleSpecificSimplifyOptions(
  puzzleLoader: PuzzleLoader,
): Promise<AppendOptions> {
  const puzzleSpecificSimplifyOptions =
    await (puzzleLoader.puzzleSpecificSimplifyOptions ??
      puzzleLoader.puzzleSpecificSimplifyOptionsPromise);
  if (!puzzleSpecificSimplifyOptions) {
    return {};
  }
  return { puzzleLoader: { puzzleSpecificSimplifyOptions } };
}
