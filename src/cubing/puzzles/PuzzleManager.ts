import { KPuzzleDefinition } from "../puzzle-geometry/interfaces";

export interface PuzzleManager {
  id: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number; // TODO: date?
  kPuzzle: () => Promise<KPuzzleDefinition>;
  svg: () => Promise<string>;
}
