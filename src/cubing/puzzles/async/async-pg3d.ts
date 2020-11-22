import type { PuzzleGeometry } from "../../puzzle-geometry";

export async function asyncGetPuzzleGeometry(
  puzzleName: string,
): Promise<PuzzleGeometry> {
  const puzzleGeometry = await import("../../puzzle-geometry");
  return puzzleGeometry.getPuzzleGeometryByName(puzzleName, [
    "allmoves",
    "true",
    "orientcenters",
    "true",
  ]);
}
