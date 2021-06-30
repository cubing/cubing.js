import { puzzles } from "../../../../../../../../puzzles";
import { parseSGS, SGSCachedData } from "../../sgs";

let cachedData: Promise<SGSCachedData> | null = null;
export async function cachedSGSDataSkewb() {
  return (cachedData ??= sgsDataSkewb());
}

// TODO: Reduce info.
export async function sgsDataSkewb(): Promise<SGSCachedData> {
  return parseSGS(
    await puzzles.skewb.def(),
    `SetOrder CORNERS 14 3 4 13 12 8 7 5
SetOrder CENTERS 11 2 10 1 6 9

Alg U
Alg U'
Alg U R
Alg U R'
Alg U' L'

Alg R
Alg R'
Alg R L
Alg R L'

Alg U L U'
Alg U L' U'
Alg U B' U
Alg U' B U'
Alg R' L' R
Alg R' B R'
Alg U L' U' B'
Alg U L' B' U
Alg U' B L U'
Alg U' B L' U'
Alg R B L R'

Alg L
Alg L'
Alg L' B
Alg L' B'
Alg L' B L
Alg L' B L'
Alg L' B' L
Alg L' B' L'

Alg B
Alg B'

Alg L B L'
Alg L B' L'
Alg R L B' L' R'

Alg B' L B L' B
Alg B' L B' L' B
Alg U' L' U' B' U L U
Alg R' L' R B R' L R
Alg U B' U' L' U B U' L
Alg U' B R' L' R B U' B'
Alg L B L' R L B' L' R'
Alg R' B U' R' B' L' U B'

Alg U R' L' R U' B' U B
Alg U B' L' U' L' B U L

Alg U' R U L' B' R B R'
Alg R U R' U' B U B' L'`,
  );
}
