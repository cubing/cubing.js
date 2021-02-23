// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../cubing/alg";

const sune = new Alg("R U R' U R U2' R'");

const antiSune = sune.inverse();
console.log(antiSune.toString());

const jPerm = antiSune.concat(new Alg("[R, [U': L']]"));
console.log(jPerm.toString());

console.log(new Alg(jPerm.experimentalLeafUnits()).toString());

console.log(new Alg("R U U' R").simplified().toString());
