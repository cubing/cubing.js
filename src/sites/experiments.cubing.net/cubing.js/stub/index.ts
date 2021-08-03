// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Alg } from "../../../../cubing/alg";
import { randomChoiceFactory } from "../../../../cubing/search/inside/solve/vendor/random-uint-below";
import { TwistyPlayerModel } from "../../../../cubing/twisty/dom/twisty-player-model/TwistyPlayerModel";
import type { PuzzleID } from "../../../../cubing/twisty/dom/TwistyPlayerConfig";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

const timeoutInput = document.body.appendChild(
  document.createElement("input"),
) as HTMLInputElement;
timeoutInput.type = "number";
timeoutInput.value = "200";
timeoutInput.step = "25";

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

  (window as any).model = model;

  async function update() {
    const randomChoice = await randomChoiceFactory<PuzzleID>();
    // TODO: 3x3x3 only works the first time.
    let puzzle = model.puzzle;
    while (puzzle === model.puzzle) {
      model.puzzle = randomChoice([
        "3x3x3",
        "megaminx",
        "pyraminx",
        "master_tetraminx",
        "7x7x7",
      ]);
    }
    console.log("model.puzzle", model.puzzle);
    setTimeout(update, parseInt(timeoutInput.value));
  }
  if (false) {
    update();
  }
})();
