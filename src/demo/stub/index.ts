// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../cubing/alg/new/Alg";

console.log(Alg.fromString("R U R'").toString());
console.log(Alg.fromString("R U .. . R'").toString());
console.log(Alg.fromString("[R2 (F),U]").toString());

import { Bunch } from "../../cubing/alg/new/Bunch";
import { Move } from "../../cubing/alg/new/Move";

console.log("" + Move.fromString("R"));
console.log("" + Move.fromString("R'"));
console.log("" + Move.fromString("R1"));
console.log("" + Move.fromString("R1'"));
console.log("" + Move.fromString("R0"));
console.log("" + Move.fromString("R0'"));
console.log(":" + Move.fromString("4783-545_REre_R3434'"));
console.log(new Alg([Move.fromString("R")]));

const alg = new Alg([Move.fromString("R"), Move.fromString("U")]);

try {
  Move.fromString("R2' ");
} catch (e) {
  console.info(e.toString());
}
try {
  Move.fromString("2342342343242423423432432R2'");
} catch (e) {
  console.info(e.toString());
}
try {
  Move.fromString("23R234234234234234234234'");
} catch (e) {
  console.info(e.toString());
}

console.log(alg);

new Move("R");

for (const unit of alg.units()) {
  console.log({ unit }, unit.toString());
}

const b = new Bunch(new Alg([Move.fromString("R'")]), -2);
console.log(b.toString());
console.log(b.toString());

console.log(Alg.fromString("R U R' U' R' F R2 U' R' U' R U R' F'"));

console.log(Alg.fromString("R U R'").isIdentical(Alg.fromString(" R U  R'")));
