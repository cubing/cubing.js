export function getPermOrPieceAtIndex(
  idx: number,
  permutationOrPieces?: number[],
) {
  if (!permutationOrPieces) {
    return idx;
  }
  return permutationOrPieces[idx] ?? idx;
}

export function getOriAtIndex(idx: number, orientations?: number[]) {
  if (!orientations) {
    return 0;
  }
  return orientations[idx] ?? 0;
}
