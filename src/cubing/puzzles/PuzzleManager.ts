import {
  KPuzzleDefinition,
  SerializedKPuzzleDefinition,
} from "../kpuzzle/definition_types";
import type { PuzzleGeometry } from "../puzzle-geometry";

export interface PuzzleManager {
  id: string;
  // shortname?: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number; // TODO: date?
  def: () => Promise<KPuzzleDefinition | SerializedKPuzzleDefinition>;
  svg: () => Promise<string>;
  llSVG?: () => Promise<string>;
  pg?: () => Promise<PuzzleGeometry>;
}
