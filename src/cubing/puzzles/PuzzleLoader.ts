import type { PuzzleGeometry } from "../puzzle-geometry";
import type { KPuzzleDefinition } from "../kpuzzle";
import type { ExperimentalStickering } from "../twisty";
import { PuzzleAppearance } from "./stickerings/appearance";

export interface PuzzleLoader {
  id: string;
  // shortname?: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number; // TODO: date?
  def: () => Promise<KPuzzleDefinition>;
  svg: () => Promise<string>;
  llSVG?: () => Promise<string>;
  pg?: () => Promise<PuzzleGeometry>;
  appearance?: (
    stickering: ExperimentalStickering,
  ) => Promise<PuzzleAppearance>;
  stickerings?: () => Promise<ExperimentalStickering[]>;
}
