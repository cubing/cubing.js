import type { PuzzleGeometry } from "../puzzle-geometry";
import type { KPuzzleDefinition } from "../kpuzzle";

export interface PuzzleManager {
  id: string;
  // shortname?: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number; // TODO: date?
  def: () => Promise<KPuzzleDefinition>;
  svg: () => Promise<string>;
  llSVG?: () => Promise<string>;
  pg3d?: () => Promise<PuzzleGeometry>;
}
