import { needFolder } from "../../../../lib/need-folder.js";
needFolder(
  new URL("../../../../../dist/esm/alg", import.meta.url).pathname,
  "make build-esm",
);

(async () => {
  const { Alg } = await import("cubing/alg");

  if (!globalThis.performance) {
    console.log("Setting `globalThis.performance = Date;`");
    globalThis.performance = Date; // Workaround for CI.
  }

  function timeAlgParsing(numMoves) {
    const moveStrings = [];
    for (let i = 0; i < numMoves; i++) {
      moveStrings.push(
        "ULFRBD"[Math.floor(Math.random() * 6)] +
          ["", "'", "2"][Math.floor(Math.random() * 3)],
      );
    }
    const start = performance.now();
    const algString = moveStrings.join(" ");
    for (let i = 0; i < 10; i++) {
      Alg.fromString(algString);
    }
    const dur = performance.now() - start;
    console.log(`Alg string: ${algString}`);
    console.log(`Parsing a ${numMoves}-move alg: ${dur}ms`);
  }

  timeAlgParsing(1);
  timeAlgParsing(10);
  timeAlgParsing(100);
  timeAlgParsing(1000);
  timeAlgParsing(10000);
})();
