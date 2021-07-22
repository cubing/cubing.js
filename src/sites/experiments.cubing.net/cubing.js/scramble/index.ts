import { randomScrambleForEvent } from "../../../../cubing/scramble";
import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import type { PuzzleID } from "../../../../cubing/twisty/dom/TwistyPlayerConfig";

const select = document.querySelector("select") as HTMLSelectElement;
const scrambleStringDiv = document.querySelector(
  "#scramble-string",
) as HTMLDivElement;
const twistyPlayer = document.querySelector("twisty-player") as TwistyPlayer;
const button = document.querySelector("button") as HTMLButtonElement;

async function newScramble() {
  scrambleStringDiv.textContent = "⏳";
  twistyPlayer.alg = "";
  const scramble = await randomScrambleForEvent(select.value);
  scrambleStringDiv.textContent = scramble.toString();
  twistyPlayer.alg = scramble;
  twistyPlayer.timeline.jumpToEnd();
}

window.addEventListener("DOMContentLoaded", () => {
  button.addEventListener("click", newScramble);
  select.addEventListener("change", () => {
    twistyPlayer.alg = "";
    try {
      twistyPlayer.puzzle = {
        222: "2x2x2",
        333: "3x3x3",
        444: "4x4x4",
        minx: "megaminx",
        clock: "clock",
      }[select.value] as PuzzleID;
    } finally {
      // TODO
    }
    setTimeout(newScramble, 100);
  });

  newScramble();
});
