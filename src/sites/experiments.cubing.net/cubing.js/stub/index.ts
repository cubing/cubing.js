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
  (await model.algIssues()).log();

  model.algProp.setFromString("R  F");
  (await model.algIssues()).log();

  model.algProp.setFromString("notamove");
  (await model.algIssues()).log();

  model.algProp.setFromString("R++");
  (await model.algIssues()).log();

  model.puzzleProp.puzzleID = "megaminx";
  (await model.algIssues()).log();

  console.log(model.visualizationProp.wrapperElement);
  document.body.appendChild(model.visualizationProp.wrapperElement);

  model.visualizationProp.visualization = "3D";
  model.visualizationProp.visualization = "2D";
  model.visualizationProp.visualization = "3D";
  model.alg = "U2 D2";

  model.alg = "R++";
  model.puzzle = "3x3x3";
  model.puzzle = "megaminx";
})();
