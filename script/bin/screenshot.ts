/**
 * Usage:
 *
 *    bun run "script/bin/screenshot.ts" "R U R' U R U2' R'"
 *
 *  */

import {
  binary,
  number as cmdNumber,
  string as cmdString,
  command,
  flag,
  oneOf,
  option,
  optional,
  positional,
  run,
  type Type,
} from "cmd-ts-too";
import { Alg } from "cubing/alg";

// We would use named imports, but that doesn't seem to be an option.
import { visualizationFormats } from "cubing/twisty/model/props/viewer/VisualizationProp.js";
import { chromium } from "playwright";
import type {
  PuzzleID,
  TwistyPlayerConfig,
  VisualizationFormat,
} from "../../src/cubing/twisty/index.js";
import { startServer } from "../lib/experiments-server/index.js";

const DEBUG = false;
const PAGE_URL =
  "http://localhost:4443/experiments.cubing.net/cubing.js/screenshot/";

// TODO: dedup with `order` implementation.
const ReadAlg: Type<string, Alg> = {
  async from(str) {
    return Alg.fromString(str);
  },
};

const anchorValues = ["start", "end"] as const;
const hintFaceletOptions = ["none", "floating"] as const;

const app = command({
  name: "screenshot",
  description: "Screenshot an alg. (You can specify an empty alg string.)",
  args: {
    alg: positional({
      type: ReadAlg,
      displayName: "Puzzle geometry ID",
    }),
    puzzle: option({
      type: optional(cmdString),
      long: "puzzle",
    }),
    stickering: option({
      type: optional(cmdString),
      long: "stickering",
    }),
    anchor: option({
      type: optional(oneOf(anchorValues)),
      long: "anchor",
    }),
    hintFacelets: option({
      type: optional(oneOf(hintFaceletOptions)),
      long: "hint-facelets",
    }),
    visualization: option({
      type: optional(oneOf(Object.keys(visualizationFormats))),
      long: "visualization",
    }),
    debug: flag({
      long: "debug",
    }),
    outFile: option({
      // TODO: implement a file path that does *not* exist: https://cmd-ts-too.vercel.app/batteries_file_system.html
      type: optional(cmdString),
      long: "out-file",
    }),
    width: option({
      type: cmdNumber,
      long: "width",
      defaultValue: () => 2048,
      defaultValueIsSerializable: true,
    }),
    height: option({
      description: "Defaults to width",
      type: optional(cmdNumber),
      long: "height",
    }),
    cameraLatitude: option({
      type: optional(cmdNumber),
      long: "camera-latitude",
    }),
    cameraLongitude: option({
      type: optional(cmdNumber),
      long: "camera-longitude",
    }),
  },
  handler: async (args) => {
    startServer();

    // The `alg` field needs to be a string to be serializable.
    // Note that `TwistyPlayerConfig & Record<string, string | number>` does not work here.
    // TODO: Introduce a `SerializableTwistyPlayerConfig` type?
    const options: TwistyPlayerConfig & { alg: string } = {
      alg: args.alg.toString(),
      puzzle: args.puzzle as PuzzleID, // TODO
      experimentalStickering: args.stickering,
      experimentalSetupAnchor: args.anchor,
      hintFacelets: args.hintFacelets,
      visualization: args.visualization as VisualizationFormat,
      cameraLatitudeLimit: 90,
    };

    // TODO: can we inline these above?
    if ("cameraLatitude" in args) {
      options.cameraLatitude = args.cameraLatitude;
    }
    if ("cameraLongitude" in args) {
      options.cameraLongitude = args.cameraLongitude;
    }

    for (const key in options) {
      if (typeof (options as any)[key] === "undefined") {
        delete (options as any)[key];
      }
    }

    console.log(options);

    options.background = "none";
    options.controlPanel = "none";

    await (async () => {
      const browser = await chromium.launch({ headless: !DEBUG });
      const context = await browser.newContext();
      const page = await context.newPage();
      const height = args.height ?? args.width;
      page.setViewportSize({
        width: args.width,
        height,
      });

      const url = new URL(PAGE_URL);
      url.searchParams.set("options", JSON.stringify(options));

      if (args.debug) {
        console.log(url.toString());
      }

      await page.goto(url.toString());
      const path = args.outFile ?? `${args.alg ?? "puzzle"}.png`;
      console.log("Output file:", path);

      await page.waitForSelector("#screenshot");

      await page.screenshot({
        path,
        omitBackground: true,
        fullPage: true,
      });

      if (!DEBUG) {
        await browser.close();
        process.exit(0);
      }
    })();
  },
});

await run(binary(app), process.argv);
