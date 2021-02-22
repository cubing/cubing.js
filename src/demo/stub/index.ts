// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { setDebug } from "../../cubing/alg/new/common";
setDebug(true);

import { Alg } from "../../cubing/alg/new/Alg";
import { Bunch } from "../../cubing/alg/new/units/containers/Bunch";
import { Move } from "../../cubing/alg/new/units/leaves/Move";
import { experimentalAppendMove } from "../../cubing/alg/operation";
import { KPuzzle, KPuzzleSVGWrapper } from "../../cubing/kpuzzle";
import { puzzles } from "../../cubing/puzzles";

console.log(Alg.fromString("R U R'").toString());
console.log(Alg.fromString("R U .. . R'").toString());
console.log(Alg.fromString("[R2 (F),U]").toString());

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

for (const unit of alg.childUnits()) {
  console.log({ unit }, unit.toString());
}

const b = new Bunch(new Alg([Move.fromString("R'")]), -2);
console.log(b.toString());
console.log(b.toString());

console.log(Alg.fromString("R U R' U' R' F R2 U' R' U' R U R' F'"));

console.log(Alg.fromString("R U R'").isIdentical(Alg.fromString(" R U  R'")));
console.log(
  experimentalAppendMove(
    Alg.fromString("R U R'"),
    Move.fromString("F2"),
  ).toString(),
);
console.log(
  experimentalAppendMove(Alg.fromString("R U R'"), Move.fromString("R'"), {
    coalesce: false,
  }).toString(),
);

console.log(
  experimentalAppendMove(Alg.fromString("R U R'"), Move.fromString("R'"), {
    coalesce: true,
  }).toString(),
);

const c = Alg.fromString("[(F): [R, (U')']]");
console.log(
  c.toString(),
  c,
  Array.from(c.experimentalLeafUnits()),
  new Alg(Array.from(c.experimentalLeafUnits())).toString(),
);

const c2 = Alg.fromString("(U')'");
console.log(
  c2.toString(),
  c2,
  Array.from(c2.experimentalLeafUnits()),
  new Alg(Array.from(c2.experimentalLeafUnits())).toString(),
);

(async () => {
  const def = await puzzles["3x3x3"].def();
  const svg = await puzzles["3x3x3"].svg();
  const svgWrapper = new KPuzzleSVGWrapper(def, svg);
  document.body.appendChild(svgWrapper.element);
  const kpuzzle = new KPuzzle(def);
  kpuzzle.applyAlg(new Alg("R U R'"));
  svgWrapper.draw(def, kpuzzle.state);
})();
