// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../cubing/alg";
import { TwistyPlayerModel } from "../../../../cubing/twisty/dom/twisty-player-model/TwistyPlayerModel";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

const model = new TwistyPlayerModel();

console.log(model);
model.algProp.alg = new Alg("R U R'");
model.puzzleProp.puzzleID = "skewb";

console.log(model.puzzleProp.puzzleLoader);
(async () => {
  model.algProp.setFromString("sdfdfsdf'sdfdsf");
  console.log(await model.displayAlgProp.algIssues());

  model.algProp.setFromString("R  F");
  console.log(await model.displayAlgProp.algIssues());

  model.algProp.setFromString("notamove");
  console.log(await model.displayAlgProp.algIssues());
})();
