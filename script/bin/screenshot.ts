/**
 * Usage:
 *
 *    bun run "script/bin/screenshot.ts" "R U R' U R U2' R'"
 *
 *  */

import { argv, exit } from "node:process";
import {
  argument,
  choice,
  flag,
  integer,
  map,
  message,
  object,
  option,
  optional,
  string,
  withDefault,
} from "@optique/core";
import { run } from "@optique/run";
import { path } from "@optique/run/valueparser";
import { Alg } from "cubing/alg";
import { experimentalStickerings } from "cubing/puzzles/cubing-private";
// We would use named imports, but that doesn't seem to be an option.
import { visualizationFormats } from "cubing/twisty/model/props/viewer/VisualizationProp.js";
import { Path } from "path-class";
import { chromium } from "playwright";
import { version as VERSION } from "../../package.json" with { type: "json" };
import type {
  PuzzleID,
  TwistyPlayerConfig,
  VisualizationFormat,
} from "../../src/cubing/twisty/index.js";
import { startServer } from "../lib/experiments-server";

const DEBUG = false;
const PAGE_URL =
  "http://localhost:4443/experiments.cubing.net/cubing.js/screenshot/";

const anchorValues = ["start", "end"] as const;
const hintFaceletOptions = ["none", "floating"] as const;

const args = run(
  object({
    alg: map(argument(string()), Alg.fromString),
    puzzle: withDefault(option("--puzzle", string()), "3x3x3"),
    stickering: optional(
      option("--stickering", choice(Object.keys(experimentalStickerings))),
    ),
    anchor: optional(option("--anchor", choice(anchorValues))),
    hintFacelets: optional(
      option("--hint-facelets", choice(hintFaceletOptions)),
    ),
    visualization: optional(
      option("--visualization", choice(Object.keys(visualizationFormats))),
    ),
    debug: optional(flag("--debug")),
    // TODO: must not exist: https://github.com/dahlia/optique/issues/56
    outFile: optional(map(option("--out-file", path()), Path.fromString)),
    width: withDefault(option("--width", integer()), 2048),
    height: optional(
      option("--height", integer(), {
        description: message`Defaults to width.`,
      }),
    ),
    cameraLatitude: optional(
      option("--camera-latitude", integer({ min: -90, max: 90 }), {}),
    ),
    // TODO: add bounds? Wrapping can be useful.
    cameraLongitude: optional(option("--camera-longitude", integer(), {})),
  }),
  {
    programName: new Path(argv[1]).basename.path,
    help: "option",
    description: message`Screenshot an alg. (You can specify an empty alg string.)`,
    completion: {
      mode: "option",
      name: "plural",
    },
    version: {
      mode: "option",
      value: VERSION,
    },
  },
);

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
const outPath = args.outFile?.path ?? `${args.alg ?? "puzzle"}.png`;
console.log("Output file:", outPath);

await page.waitForSelector("#screenshot");

await page.screenshot({
  path: outPath,
  omitBackground: true,
  fullPage: true,
});

await browser.close();
exit(0); // TODO: avoid the need for this.
