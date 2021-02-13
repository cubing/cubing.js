export type FaceletMeshAppearance =
  | "regular"
  | "dim"
  | "oriented"
  | "ignored"
  | "invisible";

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

export function getFaceletAppearance(
  appearance: PuzzleAppearance,
  orbitName: string,
  pieceIdx: number,
  faceletIdx: number,
  hint: boolean,
): FaceletMeshAppearance {
  const orbitAppearance = appearance.orbits[orbitName];
  const pieceAppearance: PieceAppearance | null =
    orbitAppearance.pieces[pieceIdx];
  if (pieceAppearance === null) {
    return "regular";
  }
  const faceletAppearance: FaceletMeshAppearance | FaceletAppearance | null =
    pieceAppearance.facelets[faceletIdx];
  if (faceletAppearance === null) {
    return "regular";
  }
  if (typeof faceletAppearance === "string") {
    return faceletAppearance;
  }
  if (hint) {
    return faceletAppearance.hintAppearance ?? faceletAppearance.appearance;
  }
  return faceletAppearance.appearance;
}
