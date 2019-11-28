import { BareBlockMove, Sequence } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { Twisty } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const elem = document.querySelector("#custom-example");
  const twisty = new Twisty(elem, {
    puzzle: Puzzles["222"],
    alg: new Sequence([
      BareBlockMove("R", 2),
      BareBlockMove("F", 2),
      BareBlockMove("U", 2),
      BareBlockMove("R", 2),
    ]),
  });
});
