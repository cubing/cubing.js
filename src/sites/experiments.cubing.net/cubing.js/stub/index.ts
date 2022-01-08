// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { countMoves } from "../../../../cubing/notation";
import { randomScrambleForEvent } from "../../../../cubing/scramble";

(async () => {
  console.log(countMoves(await randomScrambleForEvent("fto")));
})();
