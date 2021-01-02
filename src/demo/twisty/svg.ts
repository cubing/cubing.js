import { parseAlg } from "../../cubing/alg/index";
import { TwistyPlayer } from "../../cubing/twisty/index";

window.addEventListener("load", () => {
  const twistyPlayer = new TwistyPlayer({
    puzzle: "3x3x3",
    visualization: "2D",
    alg: parseAlg("M' U M' U M' U' M' U' M' U2' M' U' M' U'"),
  });
  document.body.appendChild(twistyPlayer);
  twistyPlayer.experimentalStickering = "Void Cube";
});
