// To run this file directly:
// bun run src/bin/scramble.ts -- 333

import type { Alg, ExperimentalSerializationOptions } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { setSearchDebug } from "cubing/search";

// TODO: completions for `bash`, `zsh`, and `fish`: https://github.com/loilo/completarr

const [yargs, hideBin] = await (async () => {
  try {
    const yargs = (await import("yargs")).default;
    const { hideBin } = await import("yargs/helpers");
    return [yargs, hideBin];
  } catch (e) {
    throw new Error(
      "Could not import `yargs`, which is not automatically installed as a regular dependency of `cubing`. Please run `npm install yargs` (or the equivalent) separately.",
    );
  }
})();

// @ts-ignore: Top-level await is okay because this is not part of the main library.
const argv = await yargs(
  // TODO: `hideBin` just shows `bun` in `bun`.
  hideBin(process.argv),
)
  .option("amount", {
    describe: "Amount of scrambles.",
    default: 1,
    type: "number",
    alias: "n",
  })
  .option("format", {
    describe: "Output format.",
    choices: ["text", "link", "json-text"],
    alias: "f",
  })
  .option("notation", {
    describe: "Notation type.",
    default: "auto",
    choices: ["auto", "LGN"],
  })
  .option("text", {
    type: "boolean",
    describe: "Convenient shorthand for `--format text`.",
    alias: "t",
  })
  .usage("$0 eventID", "Generate cubing scrambles.", (yargs) =>
    yargs.positional("eventID", {
      describe: "WCA or unofficial event ID",
      type: "string",
    }),
  )
  .version(false) // TODO: why doesn't `yargs` get the right version in `bun` or for the `dist` bin?
  .strictOptions().argv;

const eventID = argv.eventID as string;
let { format } = argv;
format ??= argv.text || !process.stdout.isTTY ? "text" : "auto";

setSearchDebug({ logPerf: false, showWorkerInstantiationWarnings: false });

function scrambleText(scramble: Alg): string {
  return scramble.toString({
    // TODO: any
    notation: (argv as ExperimentalSerializationOptions).notation,
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

if (format !== "json-text" && argv.amount === 1) {
  // @ts-ignore: Top-level await is okay because this is not part of the main library.
  const scramble = await randomScrambleForEvent(eventID);

  switch (format) {
    case "text": {
      // console.log(scrambleText(scramble));
      break;
    }
    case "link": {
      // console.log(scrambleLink(scramble));
      break;
    }
    case "json-text": {
      throw new Error(
        "Encountered `json` format in code that is not expected to handle it.",
      );
    }
    case "auto": {
      //       console.log(`${scrambleText(scramble)}

      // 🔗 ${scrambleLink(scramble)}`);
      break;
    }
    default: {
      throw new Error("Unknown format!");
    }
  }
} else {
  const jsonListPrinter: JSONListPrinter<string> | undefined =
    format === "json-text" ? new JSONListPrinter() : undefined;
  for (let i = 0; i < argv.amount; i++) {
    // @ts-ignore: Top-level await is okay because this is not part of the main library.
    const scramble = await randomScrambleForEvent(eventID);
    switch (format) {
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
      case "auto": {
        console.log(`// Scramble #${i + 1}
${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}
`);
        break;
      }
      default: {
        throw new Error("Unknown format!");
      }
    }
  }
  jsonListPrinter?.finish();
}
