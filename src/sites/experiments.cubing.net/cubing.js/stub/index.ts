// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { bigCubeScramble } from "../../../../cubing/search/inside/solve/puzzles/big-cubes";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  (await randomScrambleForEvent("555")).log();
  (await bigCubeScramble(6)).log();
  (await bigCubeScramble(7)).log();
})();
