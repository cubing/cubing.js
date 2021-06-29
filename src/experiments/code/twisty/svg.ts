import { Alg } from "../../../cubing/alg";
import { TwistyPlayer } from "../../../cubing/twisty";

window.addEventListener("load", () => {
  const twistyPlayer = new TwistyPlayer({
    puzzle: "3x3x3",
    visualization: "2D",
    alg: Alg.fromString("U M' U' R' U' R U M2' U' R' U r"),
  });
  document.body.appendChild(twistyPlayer);
});
