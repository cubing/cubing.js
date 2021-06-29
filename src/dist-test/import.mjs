import * as alg from "cubing/alg";
console.log(new alg.Alg("R U R'").invert().toString());

import * as kpuzzle from "cubing/kpuzzle";
console.log(kpuzzle);

import * as puzzleGeometry from "cubing/puzzle-geometry";
console.log(puzzleGeometry);

import * as stream from "cubing/stream";
console.log(stream);

// TODO: Importing `cubing` as a module, doesn't currently work, because we
// import `three` synchronously, and it doesn't define exports:
// https://github.com/mrdoob/three.js/pull/18498

import * as scramble from "cubing/scramble";
(async () => {
  // await scramble.instantiate();
  console.log((await scramble.randomScrambleForEvent("333")).toString());
  console.log((await scramble.randomScrambleForEvent("222")).toString());
})();
