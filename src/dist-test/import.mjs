import * as alg from "cubing/alg";
console.log(alg.algToString(alg.invert(alg.parse("R U R'"))));

import * as kpuzzle from "cubing/kpuzzle";
console.log(kpuzzle);

import * as puzzleGeometry from "cubing/puzzle-geometry";
console.log(puzzleGeometry);

import * as stream from "cubing/stream";
console.log(stream);

// TODO: Importing `cubing` as a module, doesn't currently work, because we
// import `three` synchronously, and it doesn't define exports:
// https://github.com/mrdoob/three.js/pull/18498
