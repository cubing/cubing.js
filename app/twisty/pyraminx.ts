import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { TwistyPlayerOld } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const twistyPlayerOld = new TwistyPlayerOld({
    puzzle: Puzzles.pyraminx,
    alg: parse("R U R' U R U R' U"),
  });
  document.body.appendChild(twistyPlayerOld);
});
