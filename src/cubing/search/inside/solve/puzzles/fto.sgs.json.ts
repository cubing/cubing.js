import type { KPuzzleDefinition } from "../../../../kpuzzle";
import { getPuzzleGeometryByName } from "../../../../puzzle-geometry";
import { parseSGS, SGSCachedData } from "../parseSGS";

export async function ftoDef(): Promise<KPuzzleDefinition> {
  return getPuzzleGeometryByName("FTO", {
    allMoves: true,
    orientCenters: true,
    addRotations: true,
  }).writekpuzzle(true);
}

let cachedData: Promise<SGSCachedData> | null = null;
export async function sgsDataFTO() {
  return (cachedData ??= uncachedSGSDataFTO());
}

// TODO: Reduce info.
async function uncachedSGSDataFTO(): Promise<SGSCachedData> {
  return parseSGS(
    await ftoDef(),
    `SubgroupSizes 24 12 11 12 12 11 10 9 11 8 10 9 7 8 10 10 6 9 8 5 7 6 5 4 4 8 7 3 6 6 2 5 3 4 3

Alg T
Alg B
Alg B T
Alg B'
Alg B' T
Alg U
Alg U T
Alg U'
Alg U' T
Alg B BL
Alg B BL T
Alg B BL'
Alg B BL' T
Alg B' BR
Alg B' BR T
Alg B' BR'
Alg B' BR' T
Alg U R'
Alg U R' T
Alg U' L
Alg U' L T
Alg B BL' D
Alg B BL' D T

Alg R
Alg R'
Alg R D
Alg R D'
Alg R BR
Alg R BR'
Alg R' F
Alg R' L
Alg R' L'
Alg B L B'
Alg U L' U'

Alg B U B'
Alg B U' B'
Alg B R B'
Alg B R' B'
Alg B' U' B
Alg B' U B L
Alg B' U B L'
Alg B' U' B BL'
Alg B U' B' BR
Alg B' R' B F

Alg BR
Alg BR'
Alg BR BL
Alg BR BL'
Alg BR' F
Alg BR' F'
Alg BR' D
Alg B BR B'
Alg U F U'
Alg BR BL L
Alg BR' D BR'

Alg B' BL B
Alg B' BL' B
Alg BR D' BR'
Alg B' BL B D'
Alg B' BL B BL
Alg B' BL B BL'
Alg B' BL L B
Alg B' BL' B F'
Alg B' BL' B L'
Alg B' BL' B BL'
Alg B' BL' L BL' B

Alg R' BR R
Alg R' BR' R
Alg BR BL' D BR
Alg R' BR D R
Alg R' BR D' R
Alg R' BR R BL
Alg B' D' BL D B
Alg BR B D' B' BR'
Alg BR BL' D BR L'
Alg BR BL' D BL BR

Alg U BR U'
Alg U BR' U'
Alg U' R U
Alg U' R' U
Alg U BR B' U'
Alg U BR' U' D
Alg U BR' U' D'
Alg U' R F' U
Alg U' R' U L'

Alg U B U'
Alg U B' U'
Alg U B U' L
Alg U B U' L'
Alg U B' U' BL'
Alg U B U' L F
Alg U B U' L F'
Alg U B' U' BL' D'

Alg B BL' L BL B'
Alg B BL' L' BL B'
Alg U B' D B U'
Alg U B' D' B U'
Alg U R D R' U'
Alg U R D' R' U'
Alg R' F L F' R
Alg R' F L' F' R
Alg B L' B F' D B
Alg U B' D' B U' D

Alg F
Alg F'
Alg F D
Alg F D'
Alg F' L
Alg F' L'
Alg F D' BL

Alg F BL F'
Alg F BL' F'
Alg BR' BL BR
Alg BR' BL' BR
Alg F BR F' BR'
Alg F BL F' BL'
Alg F BL' F' L
Alg F BL' L' F'
Alg F BR' BL BR F'

Alg F' BL F
Alg F' BL' F
Alg U BL U'
Alg U BL' U'
Alg F U' F' U
Alg F' BL F D'
Alg F' BL F BL'
Alg F' BL D F

Alg L
Alg L'
Alg L BL
Alg L BL'
Alg F' D F
Alg L BL D

Alg L' BL L
Alg L' BL' L
Alg L' BL D L
Alg L' BL D' L
Alg L' BL L BL'
Alg L' BL D' L BL
Alg L' BL D' L BL'

Alg L D L'
Alg L D' L'
Alg R' D R
Alg R' D' R
Alg L D L' D'
Alg L R L' R'
Alg L' B' L B
Alg R' D R BL
Alg L BL' L' BL L'

Alg U L' D L U'
Alg U B D B' U'
Alg U L' D' L U'
Alg U B D' B' U'
Alg R' D' BL' D R
Alg U B D' B' U' D
Alg U B' L B L' U'
Alg U B D B' U' BL'
Alg U B D' B' L' D' L U'

Alg F L F'
Alg F L' F'
Alg F L F' D
Alg F L F' D'
Alg F L' F' BL'

Alg L BL' D BL L'
Alg L BL' D' BL L'
Alg F D L D' L' F'
Alg F L D L' D' F'
Alg F L' B' L B F'
Alg F' D' R' D R F
Alg F D L D' L' F' BL'
Alg F' R' B' R' B R' F

Alg B D B'
Alg B D' B'
Alg L' D L
Alg L' D' L
Alg B D B' D'
Alg B' L B L'
Alg B D B' D' BL

Alg D
Alg D'
Alg D BL
Alg D BL'

Alg D BL' D BL D'
Alg D BL' D' BL D'
Alg B D R D' R' B'
Alg B R D R' D' B'
Alg D BL' D BL D' BL
Alg D BL' D BL D' BL'

Alg D BL D BL' D'
Alg D BL D' BL' D'
Alg B' BL' B BR D' BR'
Alg D BL D BL' D' BL
Alg D BL D BL' D' BL'

Alg D' BL D
Alg D' BL' D
Alg D' BL D BL
Alg D' BL D BL'

Alg B D' B' BL B D B'
Alg B D' B' BL' B D B'
Alg D' BL' D BL D' BL D

Alg B R' B' BL B R B'
Alg B R' B' BL' B R B'
Alg L R L' BL' L R' L'

Alg F BL' B' BL F' BL' B
Alg F' R' F BL F' R F
Alg F' R' F BL' F' R F
Alg BR R BR' BL' BR R' BR'
Alg F L' BL U BL' U' L F'
Alg F' U' F D F' U F D'
Alg F BL F' D F BL' F' BL D'

Alg F D F U' F' U D' F'
Alg F D F' BL F BL' D' F'
Alg F U D BL' U' BL D' F'
Alg F U' D F U F' D' F'
Alg F' BR L F BR' F' L' F
Alg U R BL' F BL F' R' U'

Alg BL
Alg BL'

Alg F U BL U' BL' F'
Alg F BL U BL' U' F'
Alg U BL BR BL' BR' U'
Alg BR F BL F' BL' BR'
Alg F U' F' U BL' U BL U'

Alg F U' F' D F U F' D'
Alg B' U' F U B U' F' U
Alg D F U' F' D' F U F'
Alg BR' U BR D' BR' U' BR D
Alg D' BR BL' F BL' F' BL BR' BL D

Alg U BR' U' BR BL' BR BL BR'

Alg F L F' BL D F' D' F BL' L'
Alg F' BR F BR' L BL' BR' BL BR L'
Alg B BR' U R BR' R' BR U' B' BR
Alg U BR' U' BR L' BL BR BL' BR' L

Alg B' F' BR' L R' BL U R BL' BR L' B' F BL' B'
Alg B BL F' B L BR' BL R' U' BL' R L' BR F B

Alg F' D BR F' R F R' BR' F D'
Alg B BL U' L U L' BL' U B' U'
Alg U B U' BL L U' L' U BL' B'

Alg F BL F' BL' B F' BR F BR' B'
Alg B BR F' BR' B' F BL F BL' F'
`,
  );
}
