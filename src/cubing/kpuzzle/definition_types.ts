import { MoveNotation } from "./move_notation";

// TODO: Properly handle freezing
export interface OrbitTransformation {
  permutation: number[];
  orientation: number[];
}
// TODO: Use a list instead of an object for performance?
export interface Transformation {
  orbits: { [key: string]: OrbitTransformation };
}
export type SerializedTransformation = Record<string, OrbitTransformation>;

export interface OrbitDefinition {
  numPieces: number;
  orientations: number;
}

export interface KPuzzleDefinition {
  name: string;
  orbits: Record<string, OrbitDefinition>;
  startPieces: Transformation; // TODO: Expose a way to get the transformed start pieces.
  moves: Record<string, Transformation>;
  svg?: string;
  moveNotation?: MoveNotation;
}

export interface SerializedKPuzzleDefinition {
  name: string;
  orbits: Record<string, OrbitDefinition>;
  startPieces: SerializedTransformation; // TODO: Expose a way to get the transformed start pieces.
  moves: Record<string, SerializedTransformation>;
  svg?: string;
  moveNotation?: MoveNotation;
}
