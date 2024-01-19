// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyAlgViewer, TwistyPlayer } from "../../../../cubing/twisty";
import { experimentalSetPuzzleAlgValidation } from "../../../../cubing/twisty/model/props/puzzle/state/PuzzleAlgProp";
import { solutionAlg } from "./megaminx-31x31-solve";

experimentalSetPuzzleAlgValidation(false);

// console.log(solutionAlg.toString());

setTimeout(() => {
  const player = new TwistyPlayer({
    experimentalPuzzleDescription:
      "d f 0.64 f 0.664 f 0.688 f 0.712 f 0.736 f 0.76 f 0.784 f 0.808 f 0.832 f 0.856 f 0.88 f 0.904 f 0.928 f 0.952 f 0.976",
    alg: solutionAlg,
    experimentalSetupAnchor: "end",
    experimentalSetupAlg: "Rv2 Fv Uv'",
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
