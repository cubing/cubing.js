// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { Move } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";

const player = document.body.appendChild(new TwistyPlayer());

player.experimentalAddMove(new Move("R"));

setTimeout(() => {
  player.experimentalAddMove(new Move("U"));
  console.log("pre-end");
  player.timestamp = "end";
  console.log("post-end");
  player.experimentalModel.catchUpMoveProp.set({
    move: new Move("U"),
    amount: 0,
  });
}, 1000);

// setTimeout(() => {
//   player.experimentalAddMove(new Move("U"));
// }, 2000);
