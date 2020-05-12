/* eslint-disable @typescript-eslint/no-var-requires */

/*
 *   Given a puzzle name and an algorithm, calculate the order of that
 *   algorithm (how many repetitions are needed for the algorithm to be
 *   the no-op).
 */
const alg = require('../../alg');
const kpuz = require('../../kpuzzle');
const puzg = require('../../puzzle-geometry');
const twisty = require('../../twisty');

const puzname = process.argv[2];
const algo = process.argv[3];

/*
 *   Turn a name into a geometry.
 */
const pg = puzg.getPuzzleGeometryByName(puzname, ['allmoves', true]);
/*
 *   Turn the puzzle geometry into a KPuzzleDefinition.
 */
const puzzle = pg.writekpuzzle();
/*
 *   Turn the KPuzzleDefinition into an actual operable puzzle.
 *   This returns an object that can decorate the definition with
 *   things like a move expander.
 */
const worker = new kpuz.KPuzzle(puzzle);
/*
 *   Add grips and face names so synthesized moves work.  For
 *   instance, the puzzle definition might define only 2U and 3U,
 *   but by making these calls, a move like 2-3U will operate
 *   correctly.
 */
worker.setFaceNames(pg.facenames.map(function (_) { return _[1] }));
const mps = pg.movesetgeos;
for (let i = 0; i < mps.length; i++) {
   worker.addGrip(mps[i][0], mps[i][2], mps[i][4]);
}
/*
 *   From the operable puzzle, make a twisty.  The twisty gives us
 *   access to an algorithm indexer.  This is a good way to get
 *   support for repetitions and conjugates in the algorithm.
 */
const ksp = new twisty.KSolvePuzzle(puzzle);
/*
 *   We parse the algorithm and get an indexer.
 */
const parsedAlgo = alg.parse(algo);
const tai = new twisty.TreeAlgorithmIndexer(ksp, parsedAlgo);
/*
 *   Then, we get the transform (not the state!) at the end of the
 *   algorithm.
 */
const tr = tai.transformAtIndex(tai.numMoves());
/*
 *   We calculate its order and display it.
 */
const o = kpuz.Order(puzzle, tr);
console.log(o);
