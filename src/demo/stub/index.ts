// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg, Move } from "../../cubing/alg/Alg";

console.log("" + Move.fromString("R"));
console.log("" + Move.fromString("R'"));
console.log("" + Move.fromString("R1"));
console.log("" + Move.fromString("R1'"));
console.log("" + Move.fromString("R0"));
console.log("" + Move.fromString("R0'"));
console.log(new Alg([Move.fromString("R")]));

const alg = new Alg([Move.fromString("R"), Move.fromString("r")]);

console.log(alg);

new Move("R");

for (const unit of alg.units()) {
  console.log({ unit });
}
