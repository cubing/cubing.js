import type { KState } from "./KState";

// TODO: Use a list instead of an object for performance?
export type KTransformationData = Record<string, KTransformationOrbitData>;
export interface KTransformationOrbitData {
  permutation: number[];
  orientation: number[];
}

// TODO: Use a list instead of an object for performance?
export type KStateData = Record<string, KStateOrbitData>;
export interface KStateOrbitData {
  pieces: number[];
  orientation: number[];
  // Entry values must be either a proper factor of `orbitDefinition.numOrientations` (*excluding* `orbitDefinition.numOrientations` itself) or 0.
  // An entry value of 0 indicates the default (`orbitDefinition.numOrientations`).
  // If this field is missing, this means all values are the default.
  orientationMod?: number[];
}

export interface KPuzzleOrbitDefinition {
  numPieces: number;
  numOrientations: number;
}
export interface KPuzzleDefinition {
  name: string;
  orbits: Record<string, KPuzzleOrbitDefinition>;
  startStateData: KStateData;
  moves: Record<string, KTransformationData>;
  experimentalDerivedMoves?: Record<string, string>;
  // Note: the options are intentionally required for now, since we haven't yet
  // figured out how to make sure there is no unexpected behaviour with the
  // defaults.
  experimentalIsStateSolved?: (
    kstate: KState,
    options: {
      ignorePuzzleOrientation: boolean;
      ignoreCenterOrientation: boolean;
    },
  ) => boolean;
}
