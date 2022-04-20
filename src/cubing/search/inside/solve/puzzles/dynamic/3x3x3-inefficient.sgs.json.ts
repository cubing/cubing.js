import { cube3x3x3 } from "../../../../puzzles";
import { parseSGS, SGSCachedData } from "../parseSGS";

let cachedData: Promise<SGSCachedData> | null = null;
export async function cachedSGSData3x3x3() {
  return (cachedData ??= sgsData3x3x3());
}

// TODO: Reduce info.
export async function sgsData3x3x3(): Promise<SGSCachedData> {
  return parseSGS(
    await cube3x3x3.kpuzzle(),
    `SubgroupSizes 24 24 22 20 18 16 14 21 12 18 15 10 8 12 6 4 9 3

Alg F
Alg F2
Alg F'
Alg D
Alg D2
Alg D'
Alg L
Alg L2
Alg L'
Alg F U
Alg F U2
Alg F U'
Alg F L
Alg F L2
Alg F L'
Alg F2 U
Alg F2 U'
Alg F2 R
Alg F2 R'
Alg F' D
Alg F' D'
Alg F' R
Alg F' R'

Alg U
Alg U2
Alg U'
Alg R
Alg R2
Alg R'
Alg U' B
Alg U' B2
Alg U' B'
Alg R B
Alg R B2
Alg R B'
Alg F R' F'
Alg F2 U2 L2
Alg F' U F
Alg U' B' R
Alg U' B' R'
Alg R B U'
Alg D F' R' F
Alg D' B2 U F2
Alg D' R' F2 D
Alg U F' L F
Alg U D2 F' D2

Alg B
Alg B2
Alg B'
Alg D B2 D'
Alg U R U'
Alg U R' U'
Alg L2 B2 D2
Alg L' B L
Alg R U2 R'
Alg R U' R'
Alg R2 B' R2
Alg R' B' R
Alg B F2 L' F2
Alg B D L2 D'
Alg B D L' D'
Alg B L' D L
Alg B2 F D F'
Alg B2 D L D'
Alg B2 D L' D'
Alg B' U R' U'
Alg B' U' R' U

Alg F2 L F2
Alg F2 L2 F2
Alg F2 L' F2
Alg F' L F
Alg D L D'
Alg D L2 D'
Alg D2 L2 D2
Alg U B U'
Alg U B' U'
Alg U2 R U2
Alg L F' L'
Alg L2 D L2
Alg F L F' D'
Alg F2 L2 D F2
Alg F' U' F U
Alg B' L' B L
Alg F2 U' F U F2
Alg F2 L F' D F'
Alg F' L U' F U

Alg U2 B U2
Alg U2 B2 U2
Alg U2 B' U2
Alg L2 F2 L2
Alg L2 F' L2
Alg L' D L
Alg L' D2 L
Alg L' D' L
Alg D B D' B'
Alg F L2 F L2 F'
Alg F L' D L F'
Alg F2 U L' U' F'
Alg F2 L' D L F2
Alg B F D B' F'
Alg D' L' D L F
Alg U2 B' U R U
Alg L2 F' L D' L

Alg U' R U
Alg U' R2 U
Alg U' R' U
Alg F R2 F' R2
Alg B' D B D'
Alg D B' D' B
Alg D2 R2 F2 R2
Alg D' R D R'
Alg F R D2 F' R'
Alg F R D' R' F'
Alg F2 U' R' U F'
Alg F2 R2 F' R2 F2
Alg F' D R D' R'
Alg B' F D B F'
Alg F R D' R F' R2

Alg F D F'
Alg F D2 F'
Alg F D' F'
Alg F2 D2 F2
Alg D2 F D2
Alg L D L' F'
Alg R' D' R D
Alg F D2 L D' L'
Alg F D2 R F' R'
Alg F D' L D' L'
Alg F D' R F' R'
Alg F D2 L' F L F'
Alg D2 F' D R' D R

Alg B2 D' F D B2
Alg B2 D' F2 D B2
Alg B2 D' F' D B2
Alg B2 F R F' R' B2
Alg L F R F' R' L'
Alg L D' F2 D F2 L'
Alg L2 F' R F R' L2
Alg L2 D' F D F' L2
Alg L2 D' F2 D F2 L2
Alg F' U' D F' D' F U
Alg B F2 L' F L B' F
Alg B2 R2 U' R' U R' B2
Alg D L F2 D2 F2 L' D'
Alg D' B L' F' L B' D
Alg D' L' D2 F D2 L D
Alg F R' F' L F R F' L'
Alg B2 L D2 L' D' F' D' B2
Alg L2 B' F' R F R' B L2
Alg F L2 F D' L2 F' D L2 F'
Alg F L2 D' F L2 D F' L2 F'

Alg F2 R F R' F2
Alg F2 R F2 R' F2
Alg F2 R F' R' F2
Alg F' D F D' F
Alg F L2 U L U' L
Alg F' D2 R' D' R D'
Alg F' L' D' F D L
Alg L' D' F' D L F
Alg R' L D R D' L'
Alg D F2 R F' R' F' D'
Alg F D' L F D2 F' D' L'

Alg B' D' F D B
Alg B' D' F2 D B
Alg B' D' F' D B
Alg B' F R F' R' B
Alg F R2 L' F L F' R2
Alg F' U F D' F' U' D
Alg B2 F2 L' F L B2 F
Alg B' D2 B F2 R2 F R2
Alg B' R2 U' R' U R' B
Alg D2 B2 D F2 D' B2 D2
Alg D2 B2 D F' D' B2 D2
Alg L2 B' R2 U R2 B L2
Alg L2 U' B2 R2 B2 U L2
Alg R2 F' R2 B' F2 D2 B
Alg R' B' F2 D2 B F2 R
Alg F2 R2 F' D R2 F D' R2 F2
Alg F2 R2 D F' R2 D' F R2 F2

Alg D' F D
Alg D' F2 D
Alg D' F' D
Alg F R F' R'
Alg F D' F D F2
Alg R2 U' R' U R'
Alg F D R' D' R F'
Alg F D2 F' D2 F D2
Alg D2 F' D2 F D2 F'
Alg L D2 L' D' F' D'
Alg F R F' R' D' F' D
Alg F R L' F L F' R'
Alg F R L' F2 L F' R'
Alg D F D2 F2 D2 F' D'

Alg B D' F D B'
Alg B D' F2 D B'
Alg B D' F' D B'
Alg F2 D2 F2 D2 F2 D2
Alg B F R F' R' B'
Alg B R F R' B' F'
Alg F2 L B D B' L' F2
Alg D2 F L' F L F' D2
Alg B F D' F' R' D' R D B'

Alg F D F D' F2
Alg F L' F L F'
Alg F L' F2 L F'
Alg F L' F' L F'
Alg F2 L D' L' D F2
Alg F R' F' D' F D R
Alg F2 L' U' F2 U F L F

Alg F D F2 D' F' L' F2 L
Alg F D F' D' L D' L' D
Alg F D2 F' U' F D2 F' U
Alg F U' B2 U F' U' B2 U
Alg F R F' L2 F R' F' L2
Alg F2 L' F' U' F2 U F L
Alg B R' B' L2 B R B' L2
Alg D R' D R D' F' D' F
Alg D' L D L' F2 D F2 D' F2
Alg F U' B2 D B D2 B U F' R2
Alg F L' U' F2 U F L2 D' L' D

Alg F L' F L D F D' F2
Alg F2 D F' D' L' F' L F'
Alg B2 U2 R' F2 U2 B2 L' D2
Alg F' D F U' D R' D' R U D'
Alg F2 D F D' F2 U L' F L F' U'

Alg F D2 R' D' R2 F' R' F2 D' F2
Alg F2 U2 B L B' U2 F R' F R
Alg F D' F' D B' D2 F D' F' D2 B

Alg F L' F' R' F L F' R
Alg F R' B R F' R' B' R
Alg F' U' F D2 F' U F D2
Alg F' U' B2 U F U' B2 U
Alg F' L2 F R F' L2 F R'
Alg B' U2 B D2 B' U2 B D2
Alg F D2 F' L U2 L' F D2 F' L U2 L'
Alg F' L U2 L' F D2 F' L U2 L' F D2


Alg F D2 B D F' D2 B R2 B' R2 D B' D2
Alg F D2 B D2 F' D R2 F' R2 F D2 B' D`,
  );
}
