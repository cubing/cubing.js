import { puzzles } from "../../../../../../puzzles";
import { parseSGS, type SGSCachedData } from "../../../parseSGS";

let cachedData: Promise<SGSCachedData> | null = null;
export async function sgsDataFTO() {
  return (cachedData ??= uncachedSGSDataFTO());
}

// TODO: Reduce info.
async function uncachedSGSDataFTO(): Promise<SGSCachedData> {
  return parseSGS(
    await puzzles["fto"].kpuzzle(),
    `SubgroupSizes 24 12 11 12 12 11 10 9 11 8 10 9 7 8 10 10 6 9 8 5 7 6 5 4 4 8 7 3 6 6 360

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

Alg D BL D F' U' B L' BL' L R' BR' R L' BL L B' U F D
Alg B D BR F' R' BR' R B' F D' BL D B BR' D' B'
Alg L B' BR' L F BR L' B BR' L U F U' BR' F L BL BR'
Alg L BL' D' BR' B R' U' R BR B' D BL' L'
Alg B BR B' D' B D B F' R' B' R BR' B' BR F BR' BL
Alg L' BL D L' D' L' D L' U' R' F' R U D'
Alg U' L BL L U' D R' BL B' BL F' BL' B R BL' U D' L U
Alg L BL BR' L U' D R' F' R BL' U BL D' BR L
Alg D L' R F' R' L BL' BR BL' B' BL B BR' F BL' F' D'
Alg B BL B BR' L R' U' R BR L' B
Alg L B' R' BR B F BL D' BL' D BL' B' F' BR' R U B L'
Alg D' L' BL F' D' BL' D B F' R' BR R B' F' BL' L D
Alg B D' R D' R' BL BR' B BR' B' BL' D' BR B R' B' R B' BL' D'
Alg U' L R' F U L' BL' L B BL' B' BL L U' L' F' R L' U
Alg F' D BL' BR' BL' BR B' U' F L F' U B D F L U BL' U' L'
Alg L' U BR' U D R' BL F R BL' U D' BR' L' BL' BR' L'
Alg U' L' U' D R' BL B' BL F BL' B R BL' U D' L' BL' L' U
Alg D F BL L' BL' B L' B' L' B L' B' L' BL L BL' F' D'
Alg F' BR' B BL' BR BL B' F L' F' L B BR' B' BR L' F L BL'
Alg F' L F' L U' D R' F R U D' L' BL' F L' F
Alg F U' F' BR F' R' BR' U F' L' BL F' D' BL'
Alg B BR' U R BR' R' BR U' B' BR
Alg F' BR' B BR' R BR' BL' BR R' BR BL B' BR F
Alg L' U BL B' U' BL U BL' B BR BL' BR' U' L
Alg BR BL' BR' BL L' BL BR BL' BR' L
Alg U BR' U' BR L' BL BR BL' BR' L
Alg U' L F BL' F' BL F' BR F BR' L' U
Alg F L F' BL D F' D' F BL' L'
Alg U BR' U BR L BL BR BL' BR' L' U
Alg F BR R BL' F' BL' F R' BL BR' BL F'
Alg D BL D B U BR' D BR' L' U' BR' U BR L D' BR U' B' D
Alg U BL' U' BL U BL D L' D BR D' L D BR U BR U D
Alg B' U F U' B' U F' BR' U' B L B' U BR U' B L' B BL
Alg B U' B BL U' BL L U' D R' F' R U' D' L' BL' U B
Alg B L R F D' BR' D F' R' BL' U' L U L' U BL L' B'
Alg D BL D F' BR' F BL' D R' BR' R F D' BL F' BR D
Alg L' D F' R' U BR L BL B' BL B BL' BR' L' U' R D' L
Alg F BL' U D L' U' BR R F' R' BR' U L D BL U' D BL F'
Alg BR' BL' U' L' BL D F' L' F' L F L U L' D' BR L BL
Alg B' L' BL U D R' F' R U D' L' BL L U BL' L B
Alg B BL' L U B' L BL' L B' U' B' L' D L' U' B L' B' D'
Alg B' R' L U L' R BR BL' B BR' B' BL B' BL' B'
Alg F L R BL B' U' B R' BL' L' BL F' BL BR' BL L BL' BR L'
Alg B' U' BL L U D R' F R U D' L' BL' U BL' B' U B'
Alg U BR BL' BR' D' B D' F' D B' D' F BL' U' BL' F' BL' F D'
Alg D' BL' D L BL L' D' BL D F' D F D' BL' D' BL D
Alg B' BL' B' BL L' B' BL' F' D F L F' D' F BL' L BL' B L B
Alg F BL' U D' BL' D' L' U' BR R F R' BR' U L U' D' BL F'
Alg U' D' B D F' D' BR' D' BR D BR B' BL' D F BL U BL'
Alg B BL BR D' BR L' R F R' BR' L D BL' BR' BL' B'
Alg L' F L' U BR' U' BR L F' BR' L U BR U'
Alg F' BL' D' BR' BL B' U' BL U B BL' BR D F
Alg F' D' BR' U R' U BL U' R U' BL' BR D F
Alg F U' BR F' U' BL' B U F BR' R F' U BL L
Alg B' BL' U' BL U B BL' B BL BR BL' BR' B' BL
Alg D' F' U BL U' L F U' F' U L' BL' F D
Alg F' BL' D' BR' BL BR' F' BR U' B' BR' U R' BR' F'
Alg B' U' B BL' B U' B BL' L U' L BL' L B
Alg F' D' F U' F U F' BL F' BL' D F
Alg F' D BR F' R F R' BR' F D'
Alg D BL D B BR' D L' BL' L' BL' BR' BL L BL L D' BR B' D
Alg B L BL L' BL' L' D F' R' BR R D' F L' BL' L' B'
Alg B BL' F' BL BR D' BR' F D' B' D L F' BL' F L D L D' BL
Alg B D' BR' D' BR' F D' BL' D' BL D BL F' D BR D' B'
Alg B D' B U B' D B F' BR' F L' F BR F' L U' B BL
Alg L BL' B' U BL L' BL L U L' BL' L BL' U' B BL' L'
Alg U D F' D BR BL' BR' BL B D' F D B' D BR BL BR' U'
Alg F' D BR L' U' R F' R' U BR' L D BR' BL BR D F
Alg BR' L BL L' BL' BR BL' F BL' L R BL B' U B R' BL' L' F'
Alg D BL BR D B F' R' U' BR' U R B' F D' BR' D'
Alg D' B BR' D L' BL' L' BL' BR BL L BL L D' BR B' D' BL' D'
Alg B U' R B' BL' B R' U' B BL' B' U' BL B' U' L U L'
Alg B D' B' D' BR' BL BR D' B' L B BR' U B U' BL' BR BL L' BL'
Alg B D BR' D' F BL' D' BL' D BL D F' BR D BR D B'
Alg D' B D F' D' BR' D' BR D BR BL BR' BL' BR B' BL' D F
Alg L BL B' U BL L' BL L U' L' BL' L BL' U' B BL L'
Alg B' U B' D' B U' B' D BL' U BL' U' BL' B' U BL' U'
Alg D' BR' B' L' U L' B' U B L U' L B BR D BL
Alg L' D L' F U' F' L D' L' F U BR F' L F BR' F' L BL'
Alg D BR D B F' R' U' BR U R B' F D' BR' BL' D'
Alg BR BL D F BR' BL BR BL' BR F' BR' D' BL' BR'
Alg BR' U' L' BL F' BL' F L BL' U BL BR
Alg D' BR' B' U BR U' BL U' BL' U BR' B BR D
Alg F U BR' U R U' BR B U' F' BL U' L' U BL' B'
Alg B U' L F BR F' L F' BR' F L U B'
Alg BR BL F BL' L F' BR' BL' F BL L' BL' F' BL
Alg U' BR' L BL' BR L U' BR' U L' BL L' U' BR U'
Alg L' F L' U BR' U' BR L F' L BL' BR BL BR'
Alg F' D' BR' BL U R' U BL' U' R U' BR D F
Alg F' BR' B F' U F BR U' BR' B' F BL BR BL'
Alg L B' U' R' BR B F BL D' BL D BL' B' F' BR' R B L'
Alg B F BL B L F BR' R' BL U' R BL' BR' F' L' F' BR' B
Alg U BR F' D F BR' U' L' BL L' BL' L U L B' BL L' B U'
Alg F' L B F BL B R U' R' B' BL' B' F' L BL L F
Alg D BL D B BR' D BR' D' BR D BR BL BR' BL' D' B' D
Alg D' BR' BL B BR B' BL' D BL D' B' BL B BR' BL' BR D
Alg D F' U BR U' L U' BR' U L' D B D' F D B' D BL
Alg L B BL' B L F R U' R' F' L' B' BL B' L' BL'
Alg B D' B U B' D F' BR F L' F BR' F' L B U' B BL
Alg B' BL L B' L' B' L B' BR' R' U' R BR L'
Alg D' F' U' B L' BL' L R' BR R L' BL L B' U F D' BL' D'
Alg B' F' BL' B' F U D' R BR R' BL U' BL' D B'
Alg F' BL' D BL F BL' D' B' U' B D F' D' B' F U B
Alg F' L' BL' L' B F BL B R U R' B' BL' B' F' L' F
Alg L' BL U' D F D' BL' D BL F' BL' D' BL D F' U D' BL L
Alg B' BR L R' U R BR F L' B' BL' B L F' BR L' B
Alg B' L B' BR' B L' B' D F' U F D' F U' F' BR B' BL'
Alg B' BR D' BL' BR' BL B L' R' L' R BR L D L BL BR' B BL
Alg L' D F' L F L' F D' L' BL' L' D BL' BR' BL' BR BL' D'
Alg B' F BR F BR L R' BL U R BL' BR L' B' BL' B' F
Alg F L' F' BR' B BR' F' BR B' BR' F' L F' BR'
Alg BR' B' BR BL' D' BR D BR' BL B
Alg L' F L' U BR' U' L U' BR U F' L
Alg F U' BR' R U' BR BL BR' U' BL' U' R' F' BR U
Alg B' BR' R' U' BL D' BL U BL' D R BL' BR B
Alg D BR' U' L BL' F' BL F L' BL U BL' BR D'
Alg F' BL' D' F BR' BL BR BL' BR F' BR' D BL F
Alg F' BR' BL' BR D' F' BR F BR' D BL F
Alg F' BR R' BR BL' BR' R BR' BL F
Alg B BR F' BR' B' F BL F BL' F'
Alg B D' B U B' D BL' F R' F BL F' R B F' U' B BL
Alg L BL' B' U L U L BL L B' BL B' U' BL' U' B' L' BL
Alg L' BL' U' D F D' BL' D BL F BL' D' BL D F' U D' BL' L
Alg F' L F' BL' D' BR' B R' U' R BR B' D BL' F L' F
Alg U D' BR' D BR' U' L U BR L' D' BR D L U' L' BL
Alg B' BR' B' BL B L F' BR' R' U' R BR F BR L' B
Alg U' F' D BR' F' BR D L D L' U D' B D' B' F D' BL F
Alg B F BL B F' L F BR' R' BL U' R BL' BR' F' BR' L' B
Alg F' D' BL B BR' BL BR BL' BR' D' BR' D BR D F D' B' D
Alg B' BR' B' BL B L F BR' R' U' R BR F' BR L' B
Alg L' F BR L' R' BR BL' BR' R BR' BL B' L F' L' B L' BL'
Alg B' U' BL' U D' BL' D F L' R U R' F' L U' BL U B
Alg D' B D BL BR BL' BR' D' BR' D BR D' BR B' D' BL' D'
Alg B' BR' L F' BR' R' U R BR F L' B' BL' B BR B
Alg L U L' D' BR' D L U' L' U D' BR D BR BL BR' BL' U' BL'
Alg F' L F' BL D' B BR' R' U R B' BR D BL F L' F
Alg B' L B' BR' B L' F' R F' BL F R' F BL' B' BR B' BL'
Alg F' L BL' BR' R' BL U R BR B L' B L B L' F BL' B
Alg L' F D' BR U' BR' D BR' U BR L' B' L F' L' B L' BL'
Alg B' BR' L F BR' R' U R BR F' L' B' BL' B BR B
Alg L F' D' F BR' BL BR BL' BR F' BR' D F L'
Alg F' BL' D F BL' F' BL D' BR' BL BR F
Alg B' BR' R' BL D' BL U' BL' D BL' U R BR B
Alg B' L BL' BR BL L' B' F BL F' BL' B BR' B
Alg F U' BR' R BR F' U BL L U BL' B U'
Alg B' BR B' BL F BL' B F' L BL' BR' BL L' B
Alg U' L BL' U' R U' BL' U R' U BL' L' U
Alg F U' BR' R' F' BR' F BL BR R BL' F' BR U
Alg B U' L' F' BR F L' F BR' F' L' U B'
Alg F' BR' B' F BR' BL' BR F BL B F' BL BR BL'
Alg B BL' U' L U BL' B' BL' B' L' BL U B' U' BL L BL L
Alg B R' U' B U R B' BR F D' B' D BL F' BL' BR' BL
Alg U BL U' B BL U BL U' BL D' B U B' D B U' B
Alg B BL B BL' B BR B' BL BR' R' L U' L' R B
Alg U' L BL' B BL B' L' F U B' R U R' U F' U B BL
Alg F' BL' D' BR' L' B' L B BL BR BL' B' L' B L D BL F BL
Alg L B' L' F U B' R BR B BR' R' BR BL' BR' BL B U' F' BL
Alg D' F BL B BR' B BR B' BL' D BL D' B' F' D
Alg B' L' BL F U F' L' U B U' L F U' F' BL' L BL' B BL B
Alg D BL D B U F' R' BR' R F U' B' D
Alg B BR B' D' BL BR D BR D B' BL' B D BR' BL' D' BL' D'
Alg B' R BR B' BR' R' B U' F' L B L' BL' F BL U BL'
Alg U BR BL' BR' D' B D' F' D B' BL' BR BL BR' D' F U' D'
Alg U' D' BR' U' BR' D' L' D BR' D' L D' BL' U' BL' U BL U'
Alg L' F' BR F' R F' R' L F' BR' D L BL' L' BL D' F BL'
Alg B D BL' D B U R BR R' U' B' D' BL D' B' BL
Alg B' U L' U B BL L' F' BL F D' B' U B D B' L B L'
Alg L BL' B' U L F R U' R' F' U L F' L B L' F
Alg L' D R' U BR L BL B' BL' B BL' BR' L' U' R F D' L
Alg D' B U F' R' BR R F U' B' D' BL' D'
Alg B D BL' B' U' BL L' D L D' BL' U B BL B' D'
Alg B U' BL' U' F U' B U B' F' U BL U' B U' B
Alg U BR' U L BL' L U' BR U BR' L' BL BR L' U
Alg F' D' BR' BL B' U' BL' U B BL' BR D BL F
Alg B' L' B' F BL' F' BL F' BR F BR' B L B
Alg F' BL' D' BR F' BR' F D BR' BL BR F
Alg F D' F' U' F' D' BR D F' D' BR' D' F' U
Alg BR' BL' U' BL L U' F U F' L' U BR
Alg F BR R U' BR B U BR' F BR BL' BR D BL F
Alg F' BR' F U' BL L' U BL' B' F' BL' BR D' BL F
Alg B' U L' B' U L' D F L F' D' L U' B L U' L B L'
Alg B BL B L F BR' R' U' R BR F' L' B
Alg B D' B BR' R' U' B' U R BR U' D' F L' F' U L' D' L
Alg L U' L' U B BL' U B BL B' U R B' BL B R' U B'
Alg D F' D BL U' R U' BL' U R' U B D' F D B' D BL
Alg B BL U B BR' L R' F' U' F R BR L' B' U' B'
Alg B' U' B F' D F D' B' U B D BL F' BL' D' BL F
Alg B D BR B F' U' R' BR' R U B' F BR' D' BL B'
Alg L B' F R BL' U' R' BL B F' L U BR' U' BL L U BR U'
Alg F' L F' BL L U' D R' F' R U D' L' F L' F
Alg L U L' F' BL' F L B BL' U BL' U' BL B' BL L U' L
Alg B' L F BR' R' U R BR F' L' B' BL' B'
Alg U BR' U' L' U' BR' F' BR F BR D R' F R U D' L' BL' L'
Alg B L BL L F' D R' BR' R F D' L BL L BL' L' B'
Alg F' BL' D F' D' B D' B' U' D L D BR' L' F BR D' F U
Alg B U B BR' L R' F' U F R BR L' B' U' BL' B'
Alg U B' L BL' B L' U' L' BL L BL' L U BR F' D' F BR' U'
Alg B BL' D BR B F' U' R' BR R U B' F BR' D' B'
Alg B BR B F BR' U BL' L R BR' R' L' F' U BR U BL B BL'
Alg B' BR' L R' U R BR L' B' BL' B'
Alg B' U BR' R L F' BR' F L' R' BR U' B' BR B'
Alg F' BL' F' BR R U' BR B F BR BL' D F U BL'
Alg F' BR' B' U BR' F BR' F' BR U' BR B BR F
Alg BR' BL' U' BL L' F' BL F BL' L U BR
Alg U' L BL U' R U' BL U R' U BL L' U
Alg F BR' F' U' L F BR U F' U' L' BL U BL'
Alg L' F U' BR' U L' U BR U' L F' L
Alg F' BR' B' U' BR' U F BR B U' BL U BR BL'
Alg F' BR' U BR D' BR U' BR' D F
Alg F BL' BR R BL' F' BL F R' BL BR' F'
Alg L BL' B BL' U BL U' BL B' L' F' BL F L U' L U L
Alg B F BL B F' L F' BR' R' BL U' R BL' BR' F BR' L' B
Alg F BL B' F' BR B' BR' B L F BL B' BR B BL' BR' F' L' B
Alg B F D' BL U R BL' BR' R' U' D B F' BL B
Alg L B' U B' BR B BR U' BR' B L' F BL' B F' BR' B' BL'
Alg U' L R' F L U L' BL' B BL B' L' BL L U' F' R L' U
Alg BR BL F BL' F' L' F' BR' L B BR B' L' F L B BR' B' BL
Alg B' BR' L F L' B' BL B L F' BR' R' U' R BR' L' B
Alg D L U' BR U L U' R BL' F' R' F BL F' BR' U L D BL D
Alg B F BL B F BR' L R' BL U' R BL' BR' L' F BR' B
Alg L B' L' U L' B' U L' D F L' F' D' L U' B L U' B
Alg B' BR L F' BR R' BL U R BL' BR F L' B' F BL' B' F'
Alg B' BL L B L' B' BL' L' U BL' U R' L' R U' BL U' L B
Alg B U' D' F D B BL' B' U D' R BR R' U' F' U D B'
Alg D F L F' L' F R L' BL B L B' BL' L R' F' L D'
Alg L BL D' B BR' R' U R B' BR D BL L'
Alg D F D' B' U' B U' D F' D' F U B' U B F' BL'
Alg D' BR' BL BR B' BL' B D BL' D' BL B BR' B' BL' BR D
Alg U BR' U' L U R' L R BR L' B' L' B L U' L' BL'
Alg BR' L R' U R BR B L' B L B L' BL' B
Alg B BR' B U BR' R L F' BR F L' R' BR U' B
Alg F' L B' BR' B L BL' L' B' BR B L BL L F
Alg D F U' F' U D' BR U' D' F U F' D BR'
Alg B' BL' BR D' BR' D BL BR' B BR
Alg B BL U' BR' L U BR' F' BL D BL BR F BR
Alg L' U BR BL BR' B' BL U' BL' U B BL' U' L
Alg U B' BL U' L' BL' U' F BR' R' BR U F'
Alg D BR' BL U' BL' L F' BL' F BL L' U BR D'
Alg BR L' BL BR' BL' L BL' BR BL BR'
Alg F BL F' BL' B F' BR F BR' B'
Alg D BR L' U' R F' R' U BR L BL B' BL B BL' BR D'
Alg D' BL' D BL D F' D' F D' BL' D L BL' L' D' BL D
Alg B F D' F' U' BL' B U B' BL F D B U' B' U B' F' BL
Alg B U F' D' R BR' R' U' D B BL B' U F U' B'
Alg B BL B L B BR' F BR B' BR' R' U' R F' BR L' B
Alg B BL B L F' U' F' U F BR' R' U' R BR' F BR' L' B
Alg B' U' B F' D F D' B' U B U' D BL' F' BL D' F U BL
Alg L F' BR B' F' R BL' U' R' BL B F' BR L BL BR L
Alg D F' D' BL F' D' F R BL B' L U L' B R' F' BL' D F
Alg B BL BR BL D' BR L' R F' R' BR' L D BR' BL' B'
Alg B' L B' BR' B L' BL' U BL U' B' BR B' U BL' U'
Alg D' B BR' F BL' F' D BR D' BL F' BR B' F D' BL' D'
Alg B D F' L' R F D BR' D' F' R BR' L D B' BL' D' F D'
Alg D L BL' F' R U R' B F' L BL' L' B' F' BL L' D'
Alg B' BR' L F R' U R BR B BR' F' BR B' L' B' BL' B'
Alg D L F BL F L BL' L D' BL' D' F' D' F' L BL D' BL'
Alg D F BL F' BR B' BL' B BL BR' BL L' R F R' L D'
Alg L BL' B' L B L B' L F R U R' B F'
Alg F' D' BL F R B' L U' L' B R' BL' F' D F BL' D F D'
Alg B' L' BL U' D' L' BL' L U' D R' F R U' BL' L B
Alg L' F L' BL U' BL' U L F' L U' BL U BL'
Alg D' F' BL L U' F U F' L' U BL' U' F D
Alg B' U F D F' U F D' F U B U' F U
Alg U B' BR' U R' U' R BR U' B
Alg F' BL' D F BL F' BR F' BR' F BL' D' BL F
Alg F' BR' BL' BR D BL' F BL F' D' BL F
Alg U' F R F' BL' F R' F BL F U
Alg F' BR F BR' L BL' BR' BL BR L'
Alg F U' B F U' BR U BR' U F' U' B' U F'
Alg D F' BR R F' R' F BR' D' F
Alg B D' B U B' D B U' B BR BL BR' D BL BR BL BR' BL D'
Alg B' U' L' D' F D' L' F' L D F' D L U B BL'
Alg D L' F R L' BL B L' B' BL' L R' F' L F L' F' D'
Alg D L' D' BL D F' D F D' BL' L BL D'
Alg D' B R U' B' F' BL' L BL L' BL B F U R' BR' B' D
Alg D L BL' F L BL L' B' F R U' R' B F BL L' D'
Alg D F' BL F BL U BL F' D B D' F D B' D BR BL BR' U'
Alg B F' BL B F' BR' F' L F R' U' R BL' BR BL F' L' B
Alg L F BR B' D BL D' R U' R' D BL' D' B BR' F' L BL L
Alg B F BL B F' BR' L R' U' R BL' BR BL L' B
Alg D' B U BR' D BR' L' U' BR U BR L D' BR U' B' D' BL' D'
Alg F' D' BR' BL' BR D' BR L' U' R F R' U BR' L D' F
Alg D F U D' BL U' B D' F BR F' D' F' D BR' D B' BL
Alg B U' D' F D BL' D' BR D' BR' D BL B' BL' B F' U D B'
Alg L' BL' L' F BR B' D BL D' R U R' D BL' D' B BR' F' L'
Alg B U F' U' B BL' B' U D' R BR R' D F U' B'
Alg B L BL' U' L U' L' U R BL F D' BR D F' R' L' B'
Alg B' L B' BR' B L' F' BL F BL' B' BR B' F U' F' U BL'
Alg D' B BR R U' B' F' BL' L BL' L' BL B F U R' B' D
Alg B BL' U' B BL' B D B D' B D B D' BL B' U BL B'
Alg U BR' U' BR L' F BR' L' U BR U' L F' L
Alg L' U BR BL BR' B U BR' U' BR B' BL' U' L
Alg BR BL D BR' BL' L BL' BR BL L' BL D' BL' BR'
Alg F' BL' D' BR' D BL BR' B U BR U' B' BR F
Alg F U' F' D F' U' B' U F' U' B U' F' D'
Alg B' U BR' R' U R U' BR B U'
Alg L U BL U' BL' L' BL L' F' BL' F BL L BL'
Alg U B' BL' BR' U F' BR' D' F BR' U BL' L' BL'
Alg F BL' L' F' BL D' F' BR U' R' F' U F' BR'
Alg U B U' BL L U' L' U BL' B'
Alg U BL U' B BR' B U BL' U' BL L B' BR B L' B
Alg B BL B L F' U' F U F BR' R' U' R BR' F' BR' L' B
Alg B BR D L' D' F' D F D' F' D' F D' BR' L D' B D B
Alg F' L B' L' F L' U' F R U R' F' L' U' B BL L'
Alg B' L' F U F L' F R U' R' U L F R U R' U B F' BL
Alg B U F' D' F' U R BR' R' U' F D B BL B' F U' B'
Alg F BL U BL' U' F' BL L U' L D BR L' U L U' BR' U D' L
Alg B U' D' B' F BL B BL' D' BR D BR' D BL D' F' U D B'
Alg B BL' D' B' D B BL D BR' BL BR' R D R' BR BL' BR D' B'
Alg B F U' F' D' F' U' R BL' BR' R' BL U' F D B BL B
Alg D BR' BL B' BL' B BL' BR' L' U' R F R' U BR' L D'
Alg B' F' U' F' BL' D' B BR' R' U R B' BR D F U B F
Alg B' D' B' D BR L' D F' D F D F' D' F D L D' BR' B'
Alg D' B F D BL' D' BL B BR' B' BR B' BL' F' D
Alg B D B' F BL L' BL' F' L BL L' BL' BR L R L' R' BR' L' D'
Alg B U B F' BL' B' D' F' U R BR R' U' F D F U' B'
Alg BR BL' L' F' BR U F' U' BR L' B' BR' L F' BR L' B L'
Alg D BL' L' BL D F' D' F D' BL' D L D'
Alg F' BL' B F U' B U B' D' F' BL' B U' B' BL U F D B'
Alg B' F' L BL' BR' R' BL U R BR L' B' F BL' B'
Alg BR BL' BR' BL L' F L' BL' BR BL BR' L F' L
Alg B BL BR' F U' L F U BR' F BL D BR' BL
Alg B' BL' B' U BR' U' BR BL' BR BL BR' B BL B
Alg BR' U' L F U' F' U L' BL' U BL BR
Alg B U BR R' BR U' B' BR U' B' U BR' R' BR
Alg B BR BL L BL BR' BL' L U' BL' U BL L BL' B'
Alg F' BR' B BL' BR' R BR' BL BR R' BR B' BR F
Alg F' BR' B U BR' U' B' BR BL' D' BR D BL F
Alg D' F' BR U' R' F' U F' BR' F BL' L' F' BL
Alg B BL U' L U L' BL' U B' U'
Alg L' F' R B F' BR L' D' F' D BR' L B' F R' F BL L
Alg D F BL L' BL' B L B' L B L B' L BL L BL' F' D'
Alg B BL B BR' L R' U' R BR L' B U BR' U' BR BL' BR BL BR'
Alg B' F R U' R' F' L' B L' B' L' B BL L'
Alg B' L' F D R' F' L' U L F R' U D' L' B BL L F' L
Alg D' L' BL F R' BR' R B' F D' BL D B F BL' L D
Alg B' BR' R' U' BL' U' L R' F R F' L' R U' BL BR B BL
Alg BR L BL BR L U' D R' BL F' R BL' U' D' BR U' L
Alg BR L B' L F R F U F' U' R' L' B L F' BR' L BL
Alg B F U D' R BL' BR' R' BL U' D B F' BL B
Alg L' BL L' D B D' BL' B' D' L R' D R BL' U' L U BL'
Alg L' D BL' U' R' BL F R U D' BR L' BL' BR' L'
Alg U BR' U' L' BL' U BR U' L' B' F R BL' U R' BL B F' L'
Alg BR L' BL' L' B' F R BL' U R' BL B F BR F BR L'
Alg B' F' L F BR BL B' BR' B BL' F' L' B' BR B BR' B F BL'
Alg B D BR B' D' BL' D B F' R' BR R F BR' D' B'
Alg D BL' L' BL' L BL L' BL F' BL' L' F L BL F BL' L D'
Alg U' D R' F R U L D' L D L D' BL' L
Alg U D' BR D' L' D R F BR F' BR' R' BR' D' L U' D' BL'
Alg B' F' BR' L R' BL U R BL' BR L' B' F BL' B'
Alg L' F BL' F' BL F' BR F BR' L
Alg L BL F' D F D' BL' F L' F'
Alg F' D' BR U BR' D BR' U' BR F
Alg BR' L BL' BR BL BR L' F' BR' F
Alg B BR F BR' B' BR F' R' BR' BL' BR R BR' BL
Alg BR' B U BR' R BR R' U' BR B'
Alg F' BL' BR R' BR BL BR' R BR' F
Alg BR L' BL BR' BL' BR' L U BR U'
Alg U BR' U' BR BL' BR BL BR'
`,
  );
}
