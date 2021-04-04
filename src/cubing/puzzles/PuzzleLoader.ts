import type { PuzzleGeometry } from "../puzzle-geometry";
import type { KPuzzleDefinition } from "../kpuzzle";
import { PuzzleAppearance } from "../twisty/3D/puzzles/appearance";

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
  appearance?: (stickering: string /* TODO */) => Promise<PuzzleAppearance>;
}
