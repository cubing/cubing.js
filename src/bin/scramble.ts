// To run this file directly:
// bun run src/bin/scramble.ts -- 333

// TODO: completions for `bash`, `zsh`, and `fish`: https://github.com/loilo/completarr

// Important! We import this instead of inlining, because `esbuild` preserves import order semantics but hoists imports above any code inlined here.

import type { Alg } from "cubing/alg";
import { eventInfo } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { setSearchDebug } from "cubing/search";
import "./guards/cmd-ts-too-guard";

const {
  binary,
  number: cmdNumber,
  string: cmdString,
  command,
  flag,
  oneOf,
  option,
  optional,
  positional,
  run,
} = await import("cmd-ts-too");

// TODO: file an issue about printing these values.
const outputFormats = ["text", "link", "json-text"] as const;
const notationTypes = ["auto", "LGN"] as const;

const app = command({
  name: "scramble",
  args: {
    amount: option({
      description: "Amount of scrambles",
      type: cmdNumber,
      long: "amount",
      short: "n",
      defaultValue: () => 1,
      defaultValueIsSerializable: true,
    }),
    format: option({
      description: `Output format. One of: ${outputFormats.join(", ")}`,
      type: optional(oneOf(outputFormats)),
      long: "format",
      short: "f",
    }),
    notation: option({
      description: `Notation type. One of: ${notationTypes.join(", ")}`,
      type: optional(oneOf(["auto", "LGN"])),
      long: "notation",
    }),
    text: flag({
      description: "Convenient shorthand for `--format text`.",
      long: "t", // TODO: https://github.com/lgarron/cmd-ts-too/issues/6
      short: "t",
    }),
    eventID: positional({
      type: cmdString,
      displayName: "WCA or unofficial event ID",
    }),
  },
  handler: async ({ amount, format: argsFormat, notation, text, eventID }) => {
    const format =
      argsFormat ?? (text || !process.stdout.isTTY ? "text" : "auto");

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

    if (format !== "json-text" && amount === 1) {
      const scramble = await randomScrambleForEvent(eventID);

      switch (format) {
        case "text": {
          console.log(scrambleText(scramble));
          break;
        }
        case "link": {
          console.log(scrambleLink(scramble));
          break;
        }
        // @ts-ignore This is a code guard for future refactoring.
        case "json-text": {
          throw new Error(
            "Encountered `json` format in code that is not expected to handle it.",
          );
        }
        case "auto": {
          console.log(`${scrambleText(scramble)}

🔗 ${scrambleLink(scramble)}`);
          break;
        }
        default: {
          throw new Error("Unknown format!");
        }
      }
    } else {
      const jsonListPrinter: JSONListPrinter<string> | undefined =
        format === "json-text" ? new JSONListPrinter() : undefined;
      for (let i = 0; i < amount; i++) {
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
  },
});

await run(binary(app), process.argv);
