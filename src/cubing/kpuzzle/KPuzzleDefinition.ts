// TODO: Properly handle freezing
export interface KOrbitTransformationData {
  permutation: number[];
  orientation: number[];
}

// TODO: Use a list instead of an object for performance?
export type KTransformationData = Record<string, KOrbitTransformationData>;

export interface KOrbitDefinition {
  numPieces: number;
  orientations: number;
}

export interface KPuzzleDefinition {
  name: string;
  orbits: Record<string, KOrbitDefinition>;
  startState: KTransformationData;
  moves: Record<string, KTransformationData>;
}
