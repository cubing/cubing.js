import type { KPuzzleDefinition } from "../../kpuzzle";
import type { PuzzleGeometry } from "../../puzzle-geometry";

// TODO: modify this to handle TwistyPlayer options
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

// TODO: can we cache the puzzleGeometry to avoid duplicate calls, without
// wasting memory? Maybe just save the latest one for successive calls about the
// same puzzle?
export async function asyncGetDef(
  puzzleName: string,
): Promise<KPuzzleDefinition> {
  return (await asyncGetPuzzleGeometry(puzzleName)).writekpuzzle();
}
