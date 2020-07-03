import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { TwistyPlayer } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const twistyPlayer = new TwistyPlayer({
    puzzle: Puzzles.pyraminx,
    alg: parse("R U R' U R U R' U"),
  });
  document.body.appendChild(twistyPlayer);
});
