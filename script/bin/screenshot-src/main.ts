// We would use named imports, but that doesn't seem to be an option.
import { chromium } from "playwright";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import type { TwistyPlayerConfig } from "../../../src/cubing/twisty";
import { startServer } from "../../lib/experiments-server/index.js";

const DEBUG = false;
const PAGE_URL =
  "http://localhost:4443/experiments.cubing.net/cubing.js/screenshot/";

startServer();

const args = (yargs as any)(hideBin(process.argv))
  .command(
    "[alg]",
    "Screenshot an alg. (You can specify an empty alg string.)",
    () => {},
    (argv: string[]) => {
      console.info(argv);
    },
  )
  .option("puzzle", {
    fill: "string",
  })
  .option("stickering", {
    fill: "string",
  })
  .option("anchor", {
    fill: "string",
    choices: ["start", "end"],
  })
  .option("hint-facelets", {
    fill: "string",
    choices: ["none", "floating"],
  })
  .option("visualization", {
    fill: "string",
  })
  .option("debug", {
    fill: "boolean",
  })
  .option("out-file", {
    fill: "string",
  })
  .option("width", {
    fill: "number",
    default: 2048,
  })
  .option("height", {
    fill: "number",
    default: null,
    description: "Defaults to width",
  })
  .option("camera-latitude", {
    fill: "number",
  })
  .option("camera-longitude", {
    fill: "number",
  })
  .strictOptions()
  .demandCommand(1).argv as any;

args.alg = args._[0];

const options: TwistyPlayerConfig = {
  alg: args.alg,
  puzzle: args.puzzle,
  experimentalStickering: args.stickering,
  experimentalSetupAnchor: args.anchor,
  hintFacelets: args["hint-facelets"],
  visualization: args.visualization,
  cameraLatitudeLimit: 90,
};

if ("camera-latitude" in args) {
  options.cameraLatitude = args["camera-latitude"];
}
if ("camera-longitude" in args) {
  options.cameraLongitude = args["camera-longitude"];
}

for (const key in options) {
  if (typeof (options as any)[key] === "undefined") {
    delete (options as any)[key];
  }
}

console.log(options);

options.background = "none";
options.controlPanel = "none";

(async () => {
  const browser = await chromium.launch({ headless: !DEBUG });
  const context = await browser.newContext();
  const page = await context.newPage();
  const height = args["height"] ?? args["width"];
  page.setViewportSize({
    width: args["width"],
    height,
  });

  const url = new URL(PAGE_URL);
  url.searchParams.set("options", JSON.stringify(options));

  if (args.debug) {
    console.log(url.toString());
  }

  await page.goto(url.toString());
  const path = args["out-file"] ?? `${args.alg ?? "puzzle"}.png`;
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
