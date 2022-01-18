/* eslint-disable @typescript-eslint/no-var-requires */

import { Alg } from "../cubing/alg";
import { oldTransformationOrder } from "../cubing/kpuzzle";
import { getPuzzleGeometryByName } from "../cubing/puzzle-geometry";
import { KSolvePuzzle, TreeAlgIndexer } from "../cubing/twisty";

/*
 *   Given a puzzle name and an algorithm, calculate the order of that
 *   algorithm (how many repetitions are needed for the algorithm to be
 *   the no-op).
 */

const puzname = process.argv[2];
const algo = process.argv[3];

/*
 *   Turn a name into a geometry.
 */
const pg = getPuzzleGeometryByName(puzname, { allMoves: true });
/*
 *   Turn the puzzle geometry into a KPuzzleDefinition.
 */
const puzzle = pg.writekpuzzle();
/*
 *   From the operable puzzle, make a twisty.  The twisty gives us
 *   access to an algorithm indexer.  This is a good way to get
 *   support for repetitions and conjugates in the algorithm.
 */
const ksp = new KSolvePuzzle(puzzle);
/*
 *   We parse the algorithm and get an indexer.
 */
const parsedAlgo = new Alg(algo);
const tai = new TreeAlgIndexer(ksp, parsedAlgo);
/*
 *   Then, we get the transform (not the state!) at the end of the
 *   algorithm.
 */
const tr = tai.transformAtIndex(tai.numAnimatedLeaves());
/*
 *   We calculate its order and display it.
 */
const o = oldTransformationOrder(puzzle, tr as any);
console.log(o);
