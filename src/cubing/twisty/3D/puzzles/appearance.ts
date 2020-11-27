export type FaceletMeshAppearance =
  | "regular"
  | "dim"
  | "oriented"
  | "ignored"
  | "invisible"
  | "custom";

export type FaceletAppearance = {
  appearance: FaceletMeshAppearance;
  hintAppearance?: FaceletMeshAppearance;
};

export type PieceAppearance = {
  // TODO: foundation?
  facelets: (FaceletMeshAppearance | FaceletAppearance | null)[];
};

export type OrbitAppearance = {
  pieces: (PieceAppearance | null)[];
};

export type PuzzleAppearance = {
  orbits: Record<string, OrbitAppearance>;
};
