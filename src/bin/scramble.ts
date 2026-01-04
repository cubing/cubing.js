/**

To run this file directly:

```shell
bun run -- ./src/bin/scramble.ts 333
```

To test completions:

```shell
# fish (from repo root)
set PATH (pwd)/src/test/bin-path $PATH
scramble --completions fish | source
```

```shell
# zsh (from repo root)
autoload -Uz compinit
compinit
export PATH=$(pwd)/src/test/bin-path:$PATH
source <(scramble --completions zsh)
```

*/

import { argv } from "node:process";
import {
  argument,
  choice,
  integer,
  map,
  merge,
  message,
  object,
  option,
  withDefault,
} from "@optique/core";
import { run } from "@optique/run";
import type { Alg } from "cubing/alg";
import { eventInfo, twizzleEvents } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { setSearchDebug } from "cubing/search";
import { Path } from "path-class";
import { packageVersion } from "../metadata/packageVersion";

const outputFormats = ["auto", "text", "link", "json-text"] as const;
const notationTypes = ["auto", "LGN"] as const;
const eventIDs = Object.entries(twizzleEvents)
  .filter(([_, eventInfo]) => !!eventInfo.scramblesImplemented)
  .map(([eventID, _]) => eventID);

const args = run(
  merge(
    object({
      amount: withDefault(
        option("--amount", "-n", integer({ metavar: "AMOUNT", min: 1 }), {
          description: message`Amount of scrambles.`,
        }),
        1,
      ),
      notation: withDefault(
        option("--notation", choice(notationTypes, { metavar: "NOTATION" })),
        "auto",
      ),
    }),
    object({
      format: withDefault(
        option("--format", "-f", choice(outputFormats, { metavar: "FORMAT" })),
        "auto",
      ),
    }),
    object({
      // TODO: consolidate this with `format`: https://github.com/dahlia/optique/issues/57
      text: map(
        option("--text", "-t", {
          description: message`Convenient shorthand for \`--format text\`.`,
        }),
        () => "text",
      ),
    }),
    object({
      eventID: argument(choice(eventIDs, { metavar: "EVENT_ID" }), {
        description: message`WCA or unoffiical event ID.`,
      }),
    }),
  ),
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

const { amount, format: argsFormat, notation, text, eventID } = args;
const format = argsFormat ?? text ?? (!process.stdout.isTTY ? "text" : "auto");

setSearchDebug({ logPerf: false, showWorkerInstantiationWarnings: false });

function scrambleText(scramble: Alg): string {
  return scramble.toString({
    // TODO: any
    notation: notation as (typeof notationTypes)[number], // TODO: handle type conversion at arg parse time.
  });
}

function scrambleLink(scramble: Alg): string {
  const url = new URL("https://alpha.twizzle.net/edit/");
  const puzzleID = eventInfo(eventID)?.puzzleID;
  puzzleID && url.searchParams.set("puzzle", puzzleID);
  url.searchParams.set("alg", scrambleText(scramble));
  return url.toString();
}

class JSONListPrinter<T> {
  #finished = false;
  #firstValuePrintedAlready = false;
  constructor() {
    process.stdout.write("[\n  ");
  }

  push(value: T) {
    if (this.#firstValuePrintedAlready) {
      process.stdout.write(",\n  ");
    }
    this.#firstValuePrintedAlready = true;
    process.stdout.write(JSON.stringify(value));
  }

  finish() {
    if (this.#finished) {
      throw new Error("Tried to finish JSON list printing multiple times.");
    }
    this.#finished = true;
    console.log("\n]");
  }
}

// Possibly: https://github.com/nodejs/node/issues/55468 Technically we could
// just remove `await` from the called function, but this is semantically
// unsound. This function encapsulates the unsoundness.
function nodeForgetTopLevelAwaitWorkaround(
  _promise: Promise<void>,
): Promise<void> {
  return Promise.resolve();
}

await nodeForgetTopLevelAwaitWorkaround(
  (async () => {
    if (format !== "json-text" && amount === 1) {
      const scramble = await randomScrambleForEvent(eventID);

      switch (format) {
        case "auto": {
          console.log(`${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}`);
          break;
        }
        case "text": {
          console.log(scrambleText(scramble));
          break;
        }
        case "link": {
          console.log(scrambleLink(scramble));
          break;
        }
        // @ts-expect-error This is a code guard for future refactoring.
        case "json-text": {
          throw new Error(
            "Encountered `json` format in code that is not expected to handle it.",
          );
        }
        default: {
          throw new Error("Invalid format!") as never;
        }
      }
    } else {
      const jsonListPrinter: JSONListPrinter<string> | undefined =
        format === "json-text" ? new JSONListPrinter() : undefined;
      for (let i = 0; i < amount; i++) {
        const scramble = await randomScrambleForEvent(eventID);
        switch (format) {
          case "auto": {
            console.log(`// Scramble #${i + 1}
${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}
`);
            break;
          }
          case "text": {
            console.log(`// Scramble #${i + 1}`);
            console.log(`${scrambleText(scramble)}\n`);
            break;
          }
          case "link": {
            console.log(`// Scramble #${i + 1}`);
            console.log(`${scrambleLink(scramble)}\n`);
            break;
          }
          case "json-text": {
            jsonListPrinter?.push(scramble.toString());
            break;
          }
          default: {
            throw new Error("Invalid format!") as never;
          }
        }
      }
      jsonListPrinter?.finish();
    }
  })(),
);
