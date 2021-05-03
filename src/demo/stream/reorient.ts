// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { debugKeyboardConnect } from "../../cubing/bluetooth";
import {
  ReorientedStream,
  PuzzleStreamMoveEventDetail,
  PuzzleStreamMoveEventRegisterCompatible,
} from "../../cubing/stream/process/ReorientedStream";
import { TwistyPlayer } from "../../cubing/twisty";

class Stream extends EventTarget {
  constructor() {
    super();
    (async () => {
      const keyboard = debugKeyboardConnect();
      (await keyboard).addMoveListener((e) => {
        // console.log(e);
        this.dispatchEvent(
          new CustomEvent("move", {
            detail: {
              move: e.latestMove,
            },
          }),
        );
      });
    })();
  }
}

const stream = new Stream();

const reorienter = new ReorientedStream(stream);

const player = document.body.appendChild(new TwistyPlayer());

reorienter.addEventListener(
  "move",
  (e: PuzzleStreamMoveEventRegisterCompatible) => {
    console.log(e.detail.move.toString());
    player.experimentalAddMove(e.detail.move);
  },
);

console.log(reorienter);
