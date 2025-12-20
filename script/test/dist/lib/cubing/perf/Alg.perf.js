import { Path } from "path-class";
import { needPath } from "../../../../../lib/needPath.js";

await needPath(
  Path.resolve("../../../../../../dist/lib/cubing/alg", import.meta.url),
  "make build-lib-js",
);

(async () => {
  const { Alg } = await import("cubing/alg");
  const { cube3x3x3 } = await import("cubing/puzzles");

  if (!globalThis.performance) {
    console.log("Setting `globalThis.performance = Date;`");
    globalThis.performance = Date; // Workaround for CI.
  }

  const kpuzzle = await cube3x3x3.kpuzzle();

  async function timeAlgParsing(numMoves) {
    const moveStrings = [];
    for (let i = 0; i < numMoves; i++) {
      moveStrings.push(
        "ULFRBD"[Math.floor(Math.random() * 6)] +
          ["", "'", "2"][Math.floor(Math.random() * 3)],
      );
    }
    const parseStart = performance.now();
    const algString = moveStrings.join(" ");
    const alg = Alg.fromString(algString);
    const parseDur = performance.now() - parseStart;
    // console.log(`Alg string: ${algString}`);
    console.log(`Parsing a ${numMoves}-move alg: ${parseDur}ms`);

    kpuzzle.algToTransformation(alg);
    const applyDur = performance.now() - parseStart;
    console.log(`Applying a ${numMoves}-move alg: ${applyDur}ms`);
  }

  timeAlgParsing(1);
  timeAlgParsing(10);
  timeAlgParsing(100);
  timeAlgParsing(1_000);
  timeAlgParsing(10_000);
  timeAlgParsing(100_000);
})();
