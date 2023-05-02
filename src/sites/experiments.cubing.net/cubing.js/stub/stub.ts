// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { cube3x3x3 } from "../../../../cubing/puzzles";

const postJSONInit: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

(async () => {
  const kpuzzle = await cube3x3x3.kpuzzle();
  console.log(
    await fetch("http://localhost:2023/v0/config/arg", {
      method: "POST",
      body: "--startprunedepth 5",
    }),
  );
  console.log(
    await (
      await fetch("http://localhost:2023/v0/solve/state", {
        ...postJSONInit,
        body: JSON.stringify({
          definition: kpuzzle.definition,
          state: kpuzzle.algToTransformation("R U R' F' U2 L'").toKState()
            .stateData,
          moveSubset: ["U", "L", "F"],
        }),
      })
    ).json(),
  );
})();
