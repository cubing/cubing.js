// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Move, Pause } from "cubing/alg";
import { TwistyPlayer } from "cubing/twisty";

const player = document.body.appendChild(new TwistyPlayer());
player.alg = "R U' D2 R'";
player.experimentalModel.animationTimelineLeavesRequest.set([
  { animLeaf: new Move("R", 1), start: 0, end: 200 },
  { animLeaf: new Pause(), start: 200, end: 218 },
  { animLeaf: new Move("U", -1), start: 218, end: 370 },
  { animLeaf: new Move("D", 2), start: 249, end: 520 },
  { animLeaf: new Pause(), start: 520, end: 530 },
  { animLeaf: new Move("R", -1), start: 530, end: 790 },
]);
