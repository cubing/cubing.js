import { TwistyPlayer } from "../../../../cubing/twisty";

window.addEventListener("DOMContentLoaded", () => {
  const twistyPlayer = new TwistyPlayer({
    puzzle: "3x3x3",
    visualization: "2D",
    alg: "U M' U' R' U' R U M2' U' R' U r",
  });
  document.body.appendChild(twistyPlayer);
});
