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
}

export interface KOrbitDefinition {
  numPieces: number;
  numOrientations: number;
}
export interface KPuzzleDefinition {
  name: string;
  orbits: Record<string, KOrbitDefinition>;
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
