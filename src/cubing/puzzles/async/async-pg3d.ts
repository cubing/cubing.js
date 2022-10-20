import { KPuzzle, KPuzzleDefinition } from "../../kpuzzle";
import type { PuzzleGeometry } from "../../puzzle-geometry";
import type { ExperimentalStickering } from "../../twisty";
import type { PuzzleLoader } from "../PuzzleLoader";
import type { StickeringMask } from "../stickerings/mask";
import {
  cubeLikeStickeringMask,
  cubeStickerings,
} from "../stickerings/cube-like-stickerings";
import { getCached } from "./lazy-cached";

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
export async function asyncGetKPuzzle(
  pgPromise: Promise<PuzzleGeometry>,
  puzzleName: string,
): Promise<KPuzzle> {
  const pg = await pgPromise;
  const kpuzzleDefinition: KPuzzleDefinition = pg.getKPuzzleDefinition(true);
  kpuzzleDefinition.name = puzzleName;
  const puzzleGeometry = await import("../../puzzle-geometry");
  const pgNotation = new puzzleGeometry.ExperimentalPGNotation(
    pg,
    pg.getOrbitsDef(true),
  );
  return new KPuzzle(kpuzzleDefinition, {
    experimentalPGNotation: pgNotation,
  });
}

export function asyncLazyKPuzzleGetter(
  pgPromise: Promise<PuzzleGeometry>,
  puzzleName: string,
): () => Promise<KPuzzle> {
  return getCached(() => asyncGetKPuzzle(pgPromise, puzzleName));
}

type PuzzleLoaderConstructorArgs = {
  pgID?: string;
  id: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number;
};

export class PGPuzzleLoader implements PuzzleLoader {
  pgId?: string;
  id: string;
  fullName: string;
  inventedBy?: string[];
  inventionYear?: number;
  constructor(info: PuzzleLoaderConstructorArgs) {
    this.pgId = info.pgID;
    this.id = info.id;
    this.fullName = info.fullName;
    this.inventedBy = info.inventedBy;
    this.inventionYear = info.inventionYear;
  }

  #cachedPG: Promise<PuzzleGeometry> | undefined;
  pg(): Promise<PuzzleGeometry> {
    return (this.#cachedPG ??= asyncGetPuzzleGeometry(this.pgId ?? this.id));
  }

  #cachedKPuzzle: Promise<KPuzzle> | undefined;
  kpuzzle(): Promise<KPuzzle> {
    return (this.#cachedKPuzzle ??= asyncGetKPuzzle(this.pg(), this.id));
  }

  #cachedSVG: Promise<string> | undefined;
  svg(): Promise<string> {
    return (this.#cachedSVG ??= (async () =>
      (await this.pg()).generatesvg())());
  }
}

export class CubePGPuzzleLoader extends PGPuzzleLoader {
  stickeringMask(stickering: ExperimentalStickering): Promise<StickeringMask> {
    return cubeLikeStickeringMask(this, stickering);
  }
  stickerings = cubeStickerings;
}
