// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube3x3x3 } from "../../../../cubing/puzzles";

(async () => {
  const state = (await cube3x3x3.kpuzzle()).startState();
  console.log(state.stateData);
  // state.applyAlg("U");
  // console.log(state.stateData.CENTERS);
  // state.applyAlg("U");
  // console.log(state.stateData.CENTERS);
  // state.applyAlg("U");
  // console.log(state.stateData.CENTERS);
  // state.applyAlg("z'");
  // console.log(state.stateData.CENTERS);
})();
