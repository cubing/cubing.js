/* eslint-disable @typescript-eslint/no-var-requires */

import { KPuzzle } from "../cubing/kpuzzle";
import { getPuzzleGeometryByName } from "../cubing/puzzle-geometry";

/*
 *   Given a puzzle name and an algorithm, calculate the order of that
 *   algorithm (how many repetitions are needed for the algorithm to be
 *   the no-op).
 */

const puzname = process.argv[2];
const algString = process.argv[3];

if (!puzname || !algString) {
  console.log("Usage: order <puzzle-geometry-id> <alg>");
  console.log("");
  console.log("Example: order 3x3x3 \"R U R' U R U2' R'\"");
  process.exit(0);
}

/*
 *   Turn a name into a geometry.
 */
const pg = getPuzzleGeometryByName(puzname, { allMoves: true });
const kpuzzle = new KPuzzle(pg.getKPuzzleDefinition(true));
const order = kpuzzle.algToTransformation(algString).repetitionOrder();
console.log(order);
