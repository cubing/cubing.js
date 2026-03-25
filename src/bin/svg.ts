/**

To run this file directly:

```shell
bun run -- ./src/bin/svg.ts <program args>
```

To add an `svg` binary to your path and test completions:

```shell
# fish (from repo root)
set PATH (pwd)/src/test/bin-path $PATH
svg --completions fish | source
```

```shell
# zsh (from repo root)
autoload -Uz compinit
compinit
export PATH=$(pwd)/src/test/bin-path:$PATH
source <(svg --completions zsh)
```

*/

import { basename } from "node:path";
import { argv } from "node:process";
import { argument, choice, object } from "@optique/core";
import { run } from "@optique/run";
import { puzzles } from "cubing/puzzles";
import { packageVersion } from "../metadata/packageVersion";

const args = run(
  object({
    puzzleID: argument(choice(Object.keys(puzzles), { metavar: "PUZZLE_ID" })),
  }),
  {
    programName: basename(argv[1]),
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

const puzzleLoader = puzzles[args.puzzleID];
if (!puzzleLoader) {
  throw new Error(`Invalid puzzle ID: ${args.puzzleID}`);
}

console.log(await puzzleLoader.svg());
