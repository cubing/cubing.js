// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { randomScrambleForEvent } from "../../../cubing/solve";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

(async () => {
  console.log("asyncey");
  console.log("from stub", (await randomScrambleForEvent("333")).toString());
  console.log("from stub", (await randomScrambleForEvent("333")).toString());
  console.log("from stub", (await randomScrambleForEvent("333")).toString());
  console.log("from stub", (await randomScrambleForEvent("333")).toString());
  console.log("from stub", (await randomScrambleForEvent("clock")).toString());
  console.log("from stub", (await randomScrambleForEvent("minx")).toString());
  console.log("from stub", (await randomScrambleForEvent("444")).toString());
  console.log("from stub", (await randomScrambleForEvent("444")).toString());
  console.log("from stub", (await randomScrambleForEvent("444")).toString());
  console.log("from stub", (await randomScrambleForEvent("222")).toString());
  // console.log("from stub", (await randomScrambleForEvent("444")).toString());
})();
