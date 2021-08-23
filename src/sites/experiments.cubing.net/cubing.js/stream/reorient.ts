// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  PuzzleStreamMoveEventRegisterCompatible,
  ReorientedStream,
} from "../../../../cubing/stream/process/ReorientedStream";
import "../../../../cubing/twisty";
import type { TwistyPlayerV2 } from "../../../../cubing/twisty";
import "../../../../cubing/twisty/old/dom/stream/TwistyStreamSource";
import type { TwistyStreamSource } from "../../../../cubing/twisty/old/dom/stream/TwistyStreamSource";

const twistyStreamSource: TwistyStreamSource = document.querySelector(
  "twisty-stream-source",
)!;
const reorientedPlayer: TwistyPlayerV2 = document.querySelector("#reoriented")!;
const unreorientedPlayer: TwistyPlayerV2 =
  document.querySelector("#unreoriented")!;

const reorienter = new ReorientedStream(twistyStreamSource);

reorienter.addEventListener(
  "move",
  (e: PuzzleStreamMoveEventRegisterCompatible) => {
    console.log(e.detail.move.toString());
    reorientedPlayer.experimentalAddMove(e.detail.move);
  },
);
twistyStreamSource.addEventListener(
  "move",
  (e: PuzzleStreamMoveEventRegisterCompatible) => {
    if (!"xyz".includes(e.detail.move.family)) {
      unreorientedPlayer.experimentalAddMove(e.detail.move);
    }
  },
);

console.log(reorienter);
