import type { KPuzzle } from "../kpuzzle";
import type { PuzzleGeometry } from "../puzzle-geometry";
import type { PuzzleDescriptionString } from "../puzzle-geometry/PGPuzzles";
import {
  asyncGetKPuzzle,
  puzzleSpecificSimplifyOptionsPromise,
} from "./async/async-pg3d";
import type { PuzzleLoader } from "./PuzzleLoader";

// TODO: modify this to handle TwistyPlayer options
export async function descAsyncGetPuzzleGeometry(
  desc: PuzzleDescriptionString,
  options?: { includeCenterOrbits?: boolean; includeEdgeOrbits?: boolean },
): Promise<PuzzleGeometry> {
  const puzzleGeometry = await import("../puzzle-geometry");
  return puzzleGeometry.getPuzzleGeometryByDesc(desc, {
    allMoves: true,
    orientCenters: true,
    addRotations: true,
    ...options,
  });
}

export async function asyncGetKPuzzleByDesc(
  desc: PuzzleDescriptionString,
  options?: { includeCenterOrbits?: boolean; includeEdgeOrbits?: boolean },
): Promise<KPuzzle> {
  const pgPromise = descAsyncGetPuzzleGeometry(desc, options);
  return asyncGetKPuzzle(pgPromise, `description: ${desc}`);
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
  let cachedKPuzzle: Promise<KPuzzle> | null = null;
  const kpuzzlePromiseFn = async () => {
    return (cachedKPuzzle ??= asyncGetKPuzzleByDesc(desc));
  };
  const puzzleLoader: PuzzleLoader = {
    id: `custom-${customID}`,
    fullName: info?.fullName ?? `Custom Puzzle (instance #${customID})`,
    kpuzzle: kpuzzlePromiseFn,
    svg: async () => {
      const pg = await descAsyncGetPuzzleGeometry(desc);
      return pg.generatesvg();
    },
    pg: async () => {
      return descAsyncGetPuzzleGeometry(desc);
    },
    puzzleSpecificSimplifyOptionsPromise:
      puzzleSpecificSimplifyOptionsPromise(kpuzzlePromiseFn),
  };
  if (info?.inventedBy) {
    puzzleLoader.inventedBy = info.inventedBy;
  }
  if (info?.inventionYear) {
    puzzleLoader.inventionYear = info.inventionYear;
  }
  return puzzleLoader;
}
