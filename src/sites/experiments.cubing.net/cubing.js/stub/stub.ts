// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../../cubing/twisty";

const player = document.body.appendChild(
  new TwistyPlayer({
    alg: "R U R'",
    visualization: "2D",
  }),
);
// player.experimentalSetFlashLevel("none");

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  player.puzzle = "2x2x2";
})();
