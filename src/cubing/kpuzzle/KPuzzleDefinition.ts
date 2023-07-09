// Note that it makes sense to use `field?: OptionalIntegerArray` to indicate

import type { KState } from ".";

// that a field may be missing *or* that it may be set to the value `undefined`.
export type OptionalIntegerArray = (number | undefined)[] | undefined;

// TODO: Use a list instead of an object for performance?
export type KTransformationData = Record<string, KTransformationOrbitData>;
export interface KTransformationOrbitData {
  permutation?: OptionalIntegerArray;
  orientation?: OptionalIntegerArray;
}

// TODO: Use a list instead of an object for performance?
export type KStateData = Partial<Record<string, KStateOrbitData>>;
export interface KStateOrbitData {
  pieces?: OptionalIntegerArray;
  orientation?: OptionalIntegerArray;
  // orientationMod?: OptionalIntegerArray;
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
