import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { Twisty } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const elem = document.querySelector("#custom-example")!;
  // tslint:disable-next-line: no-unused-expression
  new Twisty(elem, {
    puzzle: Puzzles["3x3x3"],
    alg: parse("U M' U' R' U' R U M2' U' R' U r"),
    playerConfig: {
      visualizationFormat: "2D",
    },
  });
});
