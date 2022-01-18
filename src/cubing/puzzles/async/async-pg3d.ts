import { KPuzzle, KPuzzleDefinition } from "../../kpuzzle";
import type { PuzzleGeometry } from "../../puzzle-geometry";
import type { PuzzleLoader } from "../PuzzleLoader";
import {
  cubeAppearance,
  cubeStickerings,
} from "../stickerings/cube-stickerings";

// TODO: modify this to handle TwistyPlayer options
export async function asyncGetPuzzleGeometry(
  puzzleName: string,
): Promise<PuzzleGeometry> {
  const puzzleGeometry = await import("../../puzzle-geometry");
  return puzzleGeometry.getPuzzleGeometryByName(puzzleName, {
    allMoves: true,
    orientCenters: true,
    addRotations: true,
  });
}

// TODO: can we cache the puzzleGeometry to avoid duplicate calls, without
// wasting memory? Maybe just save the latest one for successive calls about the
// same puzzle?
export async function asyncGetDef(
  puzzleName: string,
): Promise<KPuzzleDefinition> {
  return (await asyncGetPuzzleGeometry(puzzleName)).writekpuzzle(true);
}

export function genericPGPuzzleLoader(
  id: string,
  fullName: string,
  info?: {
    inventedBy?: string[];
    inventionYear?: number;
  },
): PuzzleLoader {
  const defPromise = asyncGetDef(id);
  let cachedKPuzzle: Promise<KPuzzle> | null = null;
  const puzzleLoader: PuzzleLoader = {
    id: id,
    fullName: fullName,
    kpuzzle: async () => {
      return (cachedKPuzzle ??= (async () => new KPuzzle(await defPromise))());
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
    puzzleLoader.inventedBy = info.inventedBy;
  }
  if (info?.inventionYear) {
    puzzleLoader.inventionYear = info.inventionYear;
  }
  return puzzleLoader;
}

export function cubePGPuzzleLoader(
  id: string,
  fullName: string,
  info?: {
    inventedBy?: string[];
    inventionYear?: number;
  },
): PuzzleLoader {
  const puzzleLoader: PuzzleLoader = genericPGPuzzleLoader(id, fullName, info);
  puzzleLoader.appearance = cubeAppearance.bind(cubeAppearance, puzzleLoader);
  puzzleLoader.stickerings = cubeStickerings;
  return puzzleLoader;
}
