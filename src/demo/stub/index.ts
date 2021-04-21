// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
} from "../../cubing/bluetooth";
import { connectSmartRobot } from "../../cubing/bluetooth/smart-robot";
import { TwistyPlayer } from "../../cubing/twisty";

const player = document.body.appendChild(new TwistyPlayer());

const button = document.body.appendChild(document.createElement("button"));
button.textContent = "connect input";
const button2 = document.body.appendChild(document.createElement("button"));
button2.textContent = "connect output";

let moveSource: BluetoothPuzzle;

button.addEventListener("click", async () => {
  moveSource = await connectSmartPuzzle();
  console.log(moveSource);
});

button2.addEventListener("click", async () => {
  const robot = await connectSmartRobot();
  (window as any).robot = robot;
  console.log(robot);

  const kb = await debugKeyboardConnect();
  kb.addMoveListener((moveEvent) => {
    console.log(moveEvent, moveEvent.latestMove);
    // moveEvent.latestMove;
    if ((window as any).skip) {
      return;
    }
    player.experimentalAddMove(moveEvent.latestMove);
    robot.applyMoves([moveEvent.latestMove]);
  });

  moveSource.addMoveListener((moveEvent) => {
    console.log(moveEvent, moveEvent.latestMove);
    // moveEvent.latestMove;
    if ((window as any).skip) {
      return;
    }
    player.experimentalAddMove(moveEvent.latestMove);
    robot.applyMoves([moveEvent.latestMove]);
  });
});
