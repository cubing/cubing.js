// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { TwistyPlayer } from "../../cubing/twisty";

const player = new TwistyPlayer({ puzzle: "3x3x3", visualization: "PG3D" });
document.body.appendChild(player);
// player.backView = "side-by-side";
// player.puzzle = "clock";
