import { parse } from "../../src/alg/index";
import { TwistyPlayer } from "../../src/twisty/index";

window.addEventListener("load", () => {
  const twistyPlayer = new TwistyPlayer({
    alg: parse("[[U', R], [U, R']]"),
    puzzle: "megaminx",
    visualization: "PG3D",
    // showFoundation: true,
  });

  document.body.appendChild(twistyPlayer);
});
