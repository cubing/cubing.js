// To run this file directly:
// bun run src/bin/order.ts -- 3x3x3 "R U R' U R U2' R'"

import { Alg } from "cubing/alg";
import { KPuzzle } from "cubing/kpuzzle";
import { getPuzzleGeometryByName } from "cubing/puzzle-geometry";
import { puzzles } from "cubing/puzzles";

import type { Type } from "cmd-ts-too";
import "./guards/cmd-ts-too-guard";

const {
  binary,
  string: cmdString,
  command,
  positional,
  run,
} = await import("cmd-ts-too");

// TODO: dedup with `screenshot` implementation.
const ReadAlg: Type<string, Alg> = {
  async from(str) {
    return Alg.fromString(str);
  },
};

const app = command({
  name: "order",
  description: "Example: order 3x3x3 \"R U R' U R U2' R'\"",
  args: {
    puzzleGeometryID: positional({
      type: cmdString,
      displayName: "Puzzle geometry ID",
    }),
    alg: positional({
      type: ReadAlg,
      displayName: "Alg",
    }),
  },
  handler: async ({ puzzleGeometryID, alg }) => {
    /*
     *   Turn a name into a geometry.
     */

    const puzzleLoader = puzzles[puzzleGeometryID];
    const kpuzzle = await (async () => {
      if (puzzleLoader) {
        return await puzzles[puzzleGeometryID].kpuzzle();
      } else {
        const pg = getPuzzleGeometryByName(puzzleGeometryID, {
          allMoves: true,
        });
        return new KPuzzle(pg.getKPuzzleDefinition(true));
      }
    })();
    const order = kpuzzle.algToTransformation(alg).repetitionOrder();
    console.log(order);
  },
});

await run(binary(app), process.argv);
