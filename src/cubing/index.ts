// TODO: `export * as ...`?
import * as alg from "../alg/index";
import * as kpuzzle from "../kpuzzle/index";
import * as twisty from "../twisty/index";
import * as bluetooth from "../bluetooth/index";
import * as puzzleGeometry from "../puzzle-geometry/index";

export {alg as alg};
export {kpuzzle as kpuzzle};
export {twisty as twisty};
export {bluetooth as bluetooth};
// TODO: Export `puzzle-geometry` as `puzzle-geometry`, if at all possible.
// https://github.com/cubing/cubing.js/issues/1
export {puzzleGeometry as puzzleGeometry};
