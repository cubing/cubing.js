// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg, Example, Turn } from "../../cubing/alg";
import { TwistyPlayer } from "../../cubing/twisty";

const a = Example.EPerm.expand();
const b = new Alg("x' R U' R' D R U R' D' R U R' D R U' R' D' x");

console.log(a.toString());
console.log(b.toString());
console.log(a.isIdentical(b));

console.log(
  new Alg("R U2").concat(new Alg("F' D")).isIdentical(new Alg("R U2 F' D")),
);

console.log(
  "a",
  new Turn("4r", 3)
    .modified({
      family: "u",
      outerLayer: 2,
    })
    .toString(),
);

// const sune = new Alg("R U R' U R U2' R'");

// const antiSune = sune.inverse();
// console.log(antiSune.toString());

// const jPerm = antiSune.concat(new Alg("[R, [U': L']]"));
// console.log(jPerm.toString());

// console.log(new Alg(jPerm.experimentalExpand()).toString());

// console.log(new Alg("R U U' R").simplify().toString());

console.log(new Alg("R U R2' R U R' R2 U' R' R U' R'").simplify().toString());
console.log(new Alg("R U R'").simplify().toString());

const c = new Alg("[R U R2', R U R']");
console.log(c.expand().toString());
console.log(c.expand().simplify().toString());
console.log(c.toString());

const player = new TwistyPlayer({
  alg: new Alg("R U R'"),
});
player.experimentalSetCursorIndexer("simple");
document.body.appendChild(player);

// console.log(new Alg("(R U')2'").expand({ depth: 0 }).toString());
// // console.log(new Alg("[(R U)2, F]").expand({ depth: 0 }).toString());
