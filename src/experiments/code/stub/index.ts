// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { combineTransformations } from "../../../../kpuzzle";
import { Alg } from "../../../cubing/alg";
import { areStatesEquivalent, KPuzzle } from "../../../cubing/kpuzzle";
import { cube3x3x3, puzzles } from "../../../cubing/puzzles";
import { randomChoiceFactory } from "../../../cubing/solve/vendor/implementations/vendor/random-uint-below";
import { cachedSGSData3x3x3 } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/3x3x3-inefficient.sgs.json";
import { cachedSGSDataSkewb } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/test/puzzles/skewb.sgs.json";
import { TrembleSolver } from "../../../cubing/solve/vendor/implementations/vendor/sgs/src/tremble";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  // const json = await cachedSGSData3x3x3();
  const json = await cachedSGSDataSkewb();

  // const def = await cube3x3x3.def();
  const def = await puzzles.skewb.def();

  const randomChoice = await randomChoiceFactory();

  // const def = await puzzles.skewb.def();
  const solver = new TrembleSolver(def, json, "RLUB".split(""));
  const kpuzzle = new KPuzzle(def);

  for (let i = 0; i < 100; i++) {
    const randomAlg = Alg.fromString(
      new Array(10)
        .fill(0)
        .map(() =>
          randomChoice([
            "U",
            "U2",
            "U'",
            "R",
            "R2",
            "R'",
            "L",
            "L2",
            "L'",
            "B",
            "B2",
            "B'",
          ]),
        )
        .join(" "),
    );
    console.log("ra", randomAlg);
    kpuzzle.applyAlg(randomAlg); //new Alg("U' B U' B U L B R' L B'"));
    // kpuzzle.applyAlg(new Alg("([U, B'])3"));
    // kpuzzle.applyAlg(
    //   new Alg("F B2 L U D2 B' D' F' L F2 L2 U2 F' R2 L2 B' D2 B2 D2 L2 F2"),
    // );
    // kpuzzle.applyAlg(new Alg("R U"));
    console.log("state", kpuzzle.state);
    const sol = await solver.solve(kpuzzle.state, 2);
    sol.log(`|||| ${randomAlg.toString()}`);

    const confirmBackward = new KPuzzle(def);
    confirmBackward.applyAlg(sol.invert());
    console.log(
      "backward",
      areStatesEquivalent(def, kpuzzle.state, confirmBackward.state),
    );

    const confirmForward = new KPuzzle(def);
    confirmForward.state = kpuzzle.state;
    confirmForward.applyAlg(sol);
    console.log(
      "forward",
      areStatesEquivalent(def, kpuzzle.state, confirmForward.state),
    );
  }

  const a = new KPuzzle(def);
  a.applyAlg(new Alg("B"));
  const b = new KPuzzle(def);
  b.applyAlg(new Alg("B2'"));
  console.log("final test", areStatesEquivalent(def, a.state, b.state));
})();
