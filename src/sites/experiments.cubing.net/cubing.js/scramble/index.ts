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
        "333": "3x3x3",
        "222": "2x2x2",
        "444": "4x4x4",
        // "555": "5x5x5",
        // "666": "6x6x6",
        // "777": "7x7x7",
        "333bf": "3x3x3",
        // "333fm": "3x3x3",
        "333oh": "3x3x3oh",
        "clock": "clock",
        "minx": "megaminx",
        // "pyram": "pyraminx",
        // "sq1": "square1",
        // "444bf": "4x4x4",
        // "555bf": "5x5x5",
      }[select.value] as PuzzleID;
    } finally {
      // TODO
    }
    twistyPlayer.visualization = ["clock", "sq1"].includes(select.value)
      ? "2D"
      : "3D";
    setTimeout(newScramble, 100);
  });

  newScramble();
});
