import type { KPuzzleDefinition } from "../../kpuzzle";
import type { PuzzleGeometry } from "../../puzzle-geometry";
import { PuzzleManager } from "../PuzzleManager";

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
    "rotations",
    "true",
  ]);
}

// TODO: can we cache the puzzleGeometry to avoid duplicate calls, without
// wasting memory? Maybe just save the latest one for successive calls about the
// same puzzle?
export async function asyncGetDef(
  puzzleName: string,
): Promise<KPuzzleDefinition> {
  return (await asyncGetPuzzleGeometry(puzzleName)).writekpuzzle(true);
}

export function genericPGPuzzle(
  id: string,
  fullName: string,
  info?: {
    inventedBy?: string[];
    inventionYear?: number;
  },
): PuzzleManager {
  const puzzleManager: PuzzleManager = {
    id: id,
    fullName: fullName,
    def: async () => {
      return asyncGetDef(id);
    },
    svg: async () => {
      const pg = await asyncGetPuzzleGeometry(id);
      return pg.generatesvg();
    },
    pg: async () => {
      return asyncGetPuzzleGeometry(id);
    },
  };
  if (info?.inventedBy) {
    puzzleManager.inventedBy = info.inventedBy;
  }
  if (info?.inventionYear) {
    puzzleManager.inventionYear = info.inventionYear;
  }
  return puzzleManager;
}
