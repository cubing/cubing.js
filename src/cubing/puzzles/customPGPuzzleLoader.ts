import { KPuzzle, KPuzzleDefinition } from "../kpuzzle";
import type { PuzzleGeometry } from "../puzzle-geometry";
import type { PuzzleDescriptionString } from "../puzzle-geometry/PGPuzzles";
import type { PuzzleLoader } from "./PuzzleLoader";

// TODO: modify this to handle TwistyPlayer options
export async function descAsyncGetPuzzleGeometry(
  desc: PuzzleDescriptionString,
): Promise<PuzzleGeometry> {
  const puzzleGeometry = await import("../puzzle-geometry");
  return puzzleGeometry.getPuzzleGeometryByDesc(desc, {
    allMoves: true,
    orientCenters: true,
    addRotations: true,
  });
}

// TODO: can we cache the puzzleGeometry to avoid duplicate calls, without
// wasting memory? Maybe just save the latest one for successive calls about the
// same puzzle?
export async function dsecAsyncGetDef(
  desc: PuzzleDescriptionString,
): Promise<KPuzzleDefinition> {
  const definition = (
    await descAsyncGetPuzzleGeometry(desc)
  ).getKPuzzleDefinition(true);
  definition.name = `description: ${desc}`;
  return definition;
}

// TODO: Can we avoid relying on IDs to deduplicate work at higher levels?
let nextCustomID = 1;

export function customPGPuzzleLoader(
  desc: PuzzleDescriptionString,
  info?: {
    fullName?: string;
    inventedBy?: string[];
    inventionYear?: number;
  },
): PuzzleLoader {
  const customID = nextCustomID++;
  const defPromise = dsecAsyncGetDef(desc);
  let cachedKPuzzle: Promise<KPuzzle> | null = null;
  const puzzleLoader: PuzzleLoader = {
    id: `custom-${customID}`,
    fullName: info?.fullName ?? `Custom Puzzle (instance #${customID})`,
    kpuzzle: async () => {
      return (cachedKPuzzle ??= (async () => new KPuzzle(await defPromise))());
    },
    svg: async () => {
      const pg = await descAsyncGetPuzzleGeometry(desc);
      return pg.generatesvg();
    },
    pg: async () => {
      return descAsyncGetPuzzleGeometry(desc);
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
