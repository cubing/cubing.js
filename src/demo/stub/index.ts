// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../cubing/alg";
import { KPuzzle } from "../../cubing/kpuzzle";
import { cube3x3x3 } from "../../cubing/puzzles";
import { Cube3D, TwistyPlayer } from "../../cubing/twisty";

const algA = new Alg("L2 D2 B L2 B2 F' U2 R2 D2 U R' D R' B L R' F' L2 R2");
const algB = new Alg("R2 F2 D2 B2 F2 L U2 B2 R B2 U2 B' L R' D2 B R' B2 D' B'");

const player = new TwistyPlayer({
  alg: algA,
  hintFacelets: "none",
});
document.body.appendChild(player);

setTimeout(async () => {
  const def = await cube3x3x3.def();
  const innerCube3D = new Cube3D(def, undefined, () => {}, {
    roundy: true,
    hintFacelets: "none",
    showFoundation: false,
  });
  const kpuzzle = new KPuzzle(def);
  kpuzzle.applyAlg(algB);
  innerCube3D.onPositionChange({
    state: kpuzzle.state,
    movesInProgress: [],
  });
  player.scene?.add(innerCube3D);
}, 100);
