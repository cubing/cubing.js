// To run this file directly:
// bun run src/bin/scramble.ts -- 333

import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { setSearchDebug } from "cubing/search";
import type { Alg } from "cubing/alg";

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
  .parserConfiguration({
    // Workaround for https://github.com/yargs/yargs/issues/2359
    "parse-positional-numbers": false,
  })
  .option("amount", {
    describe: "Output format.",
    default: 1,
    type: "number",
    alias: "n",
  })
  .option("format", {
    describe: "Output format.",
    choices: ["text", "link", "json-text"],
    alias: "f",
  })
  .positional("eventID", {
    describe: "WCA or unofficial event ID",
    type: "string",
  })
  .version(false) // TODO: why doesn't `yargs` get the right version in `bun` or for the `dist` bin?
  .demand(1)
  .strict().argv;

const eventID = argv._[0] as string;

setSearchDebug({ logPerf: false, showWorkerInstantiationWarnings: false });

function scrambleText(scramble: Alg): string {
  return scramble.toString();
}

function scrambleLink(scramble: Alg): string {
  const url = new URL("https://alpha.twizzle.net/edit/");
  const puzzleID = eventInfo(eventID)?.puzzleID;
  puzzleID && url.searchParams.set("puzzle", puzzleID);
  url.searchParams.set("alg", scramble.toString());
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

if (argv.format !== "json-text" && argv.amount === 1) {
  // @ts-ignore: Top-level await is okay because this is not part of the main library.
  const scramble = await randomScrambleForEvent(eventID);

  switch (argv.format) {
    case "text": {
      console.log(scrambleText(scramble));
      break;
    }
    case "link": {
      console.log(scrambleLink(scramble));
      break;
    }
    case "json-text": {
      throw new Error(
        "Encountered `json` format in code that is not expected to handle it.",
      );
    }
    default: {
      console.log(`${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}`);
    }
  }
} else {
  const jsonListPrinter: JSONListPrinter<string> | undefined =
    argv.format === "json-text" ? new JSONListPrinter() : undefined;
  for (let i = 0; i < argv.amount; i++) {
    // @ts-ignore: Top-level await is okay because this is not part of the main library.
    const scramble = await randomScrambleForEvent(eventID);
    switch (argv.format) {
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
        console.log(`// Scramble #${i + 1}
${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}
`);
      }
    }
  }
  jsonListPrinter?.finish();
}
