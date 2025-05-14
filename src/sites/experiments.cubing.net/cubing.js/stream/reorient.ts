// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  type PuzzleStreamMoveEventRegisterCompatible,
  ReorientedStream,
} from "../../../../cubing/stream/process/ReorientedStream";
import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import "../../../../cubing/twisty/views/stream/TwistyStreamSource";
import type { TwistyStreamSource } from "../../../../cubing/twisty/views/stream/TwistyStreamSource";

const twistyStreamSource: TwistyStreamSource = document.querySelector(
  "twisty-stream-source",
)!;
const reorientedPlayer: TwistyPlayer = document.querySelector("#reoriented")!;
const unreorientedPlayer: TwistyPlayer =
  document.querySelector("#unreoriented")!;

const reorienter = new ReorientedStream(twistyStreamSource);

reorienter.addEventListener(
  "move",
  ((e: PuzzleStreamMoveEventRegisterCompatible) => {
    console.log(e.detail.move.toString());
    reorientedPlayer.experimentalAddMove(e.detail.move);
  }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
);
twistyStreamSource.addEventListener(
  "move",
  ((e: PuzzleStreamMoveEventRegisterCompatible) => {
    if (!"xyz".includes(e.detail.move.family)) {
      unreorientedPlayer.experimentalAddMove(e.detail.move);
    }
  }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
);

console.log(reorienter);
