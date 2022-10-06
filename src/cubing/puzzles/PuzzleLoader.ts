import type { PuzzleSpecificSimplifyOptions } from "../alg";
import type { KPuzzle } from "../kpuzzle";
import type { PuzzleGeometry } from "../puzzle-geometry";
import type { ExperimentalStickering } from "../twisty";
import type { StickeringMask } from "./stickerings/mask";

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
  pg?: () => Promise<PuzzleGeometry>;
  stickeringMask?: (
    stickering: ExperimentalStickering,
  ) => Promise<StickeringMask>;
  stickerings?: () => Promise<ExperimentalStickering[]>;
  puzzleSpecificSimplifyOptions?: PuzzleSpecificSimplifyOptions;
}
