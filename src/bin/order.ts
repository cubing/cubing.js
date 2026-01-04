/**

To run this file directly:

```shell
bun run -- ./src/bin/order.ts 3x3x3 "R U R' U R U2' R'"
```

To test completions:

```shell
# fish (from repo root)
set PATH (pwd)/src/test/bin-path $PATH
order --completions fish | source
```

```shell
# zsh (from repo root)
autoload -Uz compinit
compinit
export PATH=$(pwd)/src/test/bin-path:$PATH
source <(order --completions zsh)
```

*/

import { argv } from "node:process";
import { argument, map, message, object, string } from "@optique/core";
import { run } from "@optique/run";
import { Alg } from "cubing/alg";
import { KPuzzle } from "cubing/kpuzzle";
import { getPuzzleGeometryByName } from "cubing/puzzle-geometry";
import { puzzles } from "cubing/puzzles";
import { Path } from "path-class";
import { packageVersion } from "../metadata/packageVersion";

const args = run(
  object({
    puzzleGeometryID: argument(string({ metavar: "PUZZLE" }), {
      description: message`Puzzle geometry ID`,
    }),
    alg: map(
      argument(string({ metavar: "ALG" }), {
        description: message`Alg`,
      }),
      Alg.fromString,
    ),
  }),
  {
    programName: new Path(argv[1]).basename.path,
    description: message`Example: order 3x3x3 "R U R' U R U2' R'"`,
    help: "option",
    completion: {
      mode: "option",
      name: "plural",
    },
    version: {
      mode: "option",
      value: packageVersion,
    },
  },
);

const { puzzleGeometryID, alg } = args;

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
