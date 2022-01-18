import type { MoveNotation } from "./move_notation";

// TODO: Properly handle freezing
export interface OldOrbitTransformation {
  permutation: number[];
  orientation: number[];
}
// TODO: Use a list instead of an object for performance?
export type Transformation = Record<string, OldOrbitTransformation>;

export interface OldOrbitDefinition {
  numPieces: number;
  orientations: number;
}

export interface OldKPuzzleDefinition {
  name: string;
  orbits: Record<string, OldOrbitDefinition>;
  startPieces: Transformation; // TODO: Expose a way to get the transformed start pieces.
  moves: Record<string, Transformation>;
  svg?: string;
  moveNotation?: MoveNotation;
}
