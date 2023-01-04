// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../../../cubing/twisty";

document.body.appendChild(
  new TwistyPlayer({
    puzzle: "2x2x2",
    visualization: "experimental-2D-LL",
    experimentalStickering: "OLL",
  }),
);
