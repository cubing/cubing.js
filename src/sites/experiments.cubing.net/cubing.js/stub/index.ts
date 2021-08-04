// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { solveSkewb } from "../../../../cubing/search";
import { randomSkewbState } from "../../../../cubing/search/inside/solve/puzzles/skewb";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  (await solveSkewb(await randomSkewbState())).log();
})();
