import { eventInfo } from "../../../../cubing/puzzles";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";

const select = document.querySelector("select") as HTMLSelectElement;
const scrambleStringDiv = document.querySelector(
  "#scramble-string",
) as HTMLDivElement;
const twistyPlayer = document.querySelector("twisty-player") as TwistyPlayer;
const button = document.querySelector("button") as HTMLButtonElement;

async function loadNewScramble() {
  scrambleStringDiv.textContent = "⏳";
  twistyPlayer.alg = "";
  const scramble = await randomScrambleForEvent(select.value);
  scrambleStringDiv.textContent = scramble.toString();
  twistyPlayer.alg = scramble;
}

globalThis.addEventListener("DOMContentLoaded", async () => {
  button.addEventListener("click", loadNewScramble);
  select.addEventListener("change", () => {
    twistyPlayer.alg = "";
    try {
      twistyPlayer.puzzle = eventInfo(select.value)!.puzzleID;
    } finally {
      // TODO
    }
    twistyPlayer.visualization = ["clock", "sq1"].includes(select.value)
      ? "2D"
      : "3D";
    setTimeout(loadNewScramble, 100);
  });

  void loadNewScramble();
});
