import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { TwistyPlayer } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const twistyPlayer = new TwistyPlayer({
    puzzle: Puzzles["3x3x3"],
    alg: parse("U M' U' R' U' R U M2' U' R' U r"),
    playerConfig: {
      visualizationFormat: "2D",
    },
  });
  document.body.appendChild(twistyPlayer);
});
