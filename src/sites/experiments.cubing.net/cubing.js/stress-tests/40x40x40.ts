// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";
import { experimentalSetPuzzleAlgValidation } from "../../../../cubing/twisty/model/props/puzzle/state/PuzzleAlgProp";
import { solutionAlg } from "./40x40x40-solve";

experimentalSetPuzzleAlgValidation(false);

// console.log(solutionAlg.toString());

setTimeout(() => {
  const player = new TwistyPlayer({
    puzzle: "40x40x40",
    alg: solutionAlg,
    experimentalSetupAnchor: "end",
  });
  document.querySelector("#player-wrapper")!.appendChild(player);

  document
    .querySelector("#show-reconstruction")
    ?.addEventListener("click", () => {
      const wrapper = document.querySelector("#alg-viewer-wrapper");
      const algViewer = new TwistyAlgViewer({
        twistyPlayer: player,
      });
      wrapper!.textContent = "";
      wrapper!.appendChild(algViewer);
    });
}, 1000);
