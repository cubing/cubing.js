import { KPuzzle } from "../../../../../../kpuzzle";
import { parseSGS, type SGSCachedData } from "../../../parseSGS";

async function skewbKPuzzleWithoutMO(): Promise<KPuzzle> {
  const { getPuzzleGeometryByName, ExperimentalPGNotation } = await import(
    "../../../../../../puzzle-geometry"
  );
  const pg = getPuzzleGeometryByName("skewb", {
    allMoves: true,
    addRotations: true,
  });
  return new KPuzzle(pg.getKPuzzleDefinition(true), {
    experimentalPGNotation: new ExperimentalPGNotation(
      pg,
      pg.getOrbitsDef(true),
    ),
  });
}

// TODO: Implement a general lazy Promise/ Promise cache wrapper
let defCache: Promise<KPuzzle> | null = null;
export async function skewbKPuzzleWithoutMOCached(): Promise<KPuzzle> {
  return (defCache ??= skewbKPuzzleWithoutMO());
}

let cachedData: Promise<SGSCachedData> | null = null;
export async function sgsDataSkewb() {
  return (cachedData ??= uncachedSGSDataSkewb());
}

export async function sgsDataSkewbFixedCorner(): Promise<SGSCachedData> {
  return {
    ordering: (await sgsDataSkewb()).ordering.slice(1),
  };
}

// TODO: Reduce info.
async function uncachedSGSDataSkewb(): Promise<SGSCachedData> {
  return parseSGS(
    await skewbKPuzzleWithoutMOCached(),
    `SubgroupSizes 24 6 5 12 9 3 4 9 3 3

Alg y
Alg y2
Alg y'
Alg F
Alg F'
Alg y U
Alg y U'
Alg y L
Alg y L'
Alg y F
Alg y F'
Alg y2 U
Alg y2 U'
Alg y2 B
Alg y2 B'
Alg y' U
Alg y' F'
Alg y U L'
Alg y U B
Alg y2 U B
Alg y2 U B'
Alg y2 U' B
Alg y2 U' B'

Alg U
Alg U'
Alg U L
Alg U L'
Alg U' R'

Alg R
Alg R'
Alg R B
Alg R' L'

Alg U B' U
Alg U' L U
Alg U' L' U
Alg U' B U'
Alg R L R'
Alg R B' R
Alg U B L U'
Alg U B' U B'
Alg U B' L' U
Alg U' L B U'
Alg R' B L' R'

Alg L
Alg L'
Alg L B
Alg L B'
Alg L B L
Alg L B L'
Alg L B' L
Alg L B' L'

Alg B
Alg B'

Alg L' B L
Alg L' B' L
Alg R' L' B L R

Alg B L' B L B'
Alg B L' B' L B'
Alg U L U B U' L' U'
Alg R L R' B' R L' R'
Alg U B' R L R' B' U B
Alg U' B U L U' B' U L'
Alg L U' B U L' U' B' U
Alg R B' U R B L U' B

Alg U L U' B' U L' U' B
Alg U' B L U L B' U' L'

Alg U R' U' L B R' B' R
Alg R' U' R U B' U' B L`,
  );
}
