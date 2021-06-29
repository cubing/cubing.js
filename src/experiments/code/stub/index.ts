// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../cubing/alg";
import { KPuzzle } from "../../../cubing/kpuzzle";
import { cube2x2x2 } from "../../../cubing/puzzles";
import { experimentalSolve2x2x2 } from "../../../cubing/solve";
// import { random222Scramble } from "../../../cubing/solve/vendor/implementations/2x2x2";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

// (async () => {
//   (await random222Scramble()).log("222");
// })();
(async () => {
  // const state = await random222State();
  const kpuzzle = new KPuzzle(await cube2x2x2.def());
  kpuzzle.applyAlg(new Alg("R U R' D2 F2 L2 R U2 x L2 F R'"));

  (await experimentalSolve2x2x2(kpuzzle.state)).log();

  // const state = kpuzzle.state;
  // console.log("random state", state);

  // const player = new TwistyPlayer({
  //   puzzle: "2x2x2",
  // });
  // player.experimentalSetStartStateOverride(JSON.parse(JSON.stringify(state)));
  // document.body.appendChild(player);
  // console.log("def", await cube2x2x2.def());
  // const solver = new TrembleSolver(await cube2x2x2.def(), sgs);
  // console.log((await solver.solve(state)).invert());

  // // const str = JSON.stringify(sgs);
  // // // console.log(sgs);
  // globalThis?.document?.body
  //   .appendChild(document.createElement("button"))
  //   .addEventListener("click", () => {
  //     console.log("click");
  //     navigator.clipboard.writeText(str);
  //   });
})();
