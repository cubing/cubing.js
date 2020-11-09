console.log("Attempting to import the entire `cubing` module.");

const cubing = require("cubing");
console.log(cubing);

console.log(
  "Attempting to use `cubing/alg to invert an alg (should return R U' R').",
);

const alg = require("cubing/alg");
console.log(alg.algToString(alg.invert(alg.parse("R U R'"))));

console.log("Importing individual modules.");
require("cubing/alg");
require("cubing/bluetooth");
require("cubing/kpuzzle");
require("cubing/protocol");
require("cubing/puzzle-geometry");
require("cubing/stream");
require("cubing/twisty");
