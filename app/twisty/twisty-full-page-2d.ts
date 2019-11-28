import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { Twisty } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const elem = document.querySelector("#custom-example");
  const tw = new Twisty(elem, {
    puzzle: Puzzles["333"],
    alg: parse("U M' U' R' U' R U M2' U' R' U r"),
    playerConfig: {
      visualizationFormat: "2D",
    },
  });
});
