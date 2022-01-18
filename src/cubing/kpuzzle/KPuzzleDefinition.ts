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
  orientations: number;
}
export interface KPuzzleDefinition {
  name: string;
  orbits: Record<string, KOrbitDefinition>;
  startStateData: KStateData;
  moves: Record<string, KTransformationData>;
}
