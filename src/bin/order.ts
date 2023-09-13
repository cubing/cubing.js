// To run this file directly:
// bun run src/bin/order.ts -- <program args>

import { KPuzzle } from "cubing/kpuzzle";
import { getPuzzleGeometryByName } from "cubing/puzzle-geometry";
import { puzzles } from "cubing/puzzles";

/*
 *   Given a puzzle name and an algorithm, calculate the order of that
 *   algorithm (how many repetitions are needed for the algorithm to be
 *   the no-op).
 */

const puzzleName = process.argv[2];
const algString = process.argv[3];

if (!(puzzleName && algString)) {
  console.log("Usage: order <puzzle-geometry-id> <alg>");
  console.log("");
  console.log("Example: order 3x3x3 \"R U R' U R U2' R'\"");
  process.exit(0);
}

/*
 *   Turn a name into a geometry.
 */

// @ts-ignore: Top-level await is okay because this is not part of the main library.
let kpuzzle = await puzzles[puzzleName].kpuzzle();
if (!kpuzzle) {
  const pg = getPuzzleGeometryByName(puzzleName, { allMoves: true });
  kpuzzle = new KPuzzle(pg.getKPuzzleDefinition(true));
}
const order = kpuzzle.algToTransformation(algString).repetitionOrder();
console.log(order);
