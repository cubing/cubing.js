// We would use named imports, but that doesn't seem to be an option.
import puppeteer from "puppeteer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { startServer } from "../../lib/experiments-server/index.js";
import { ensureChromiumDownload } from "../../lib/puppeteer.js";

await ensureChromiumDownload();

const PAGE_URL =
  "http://localhost:4443/experiments.cubing.net/cubing.js/screenshot/";

startServer();

const args = yargs(hideBin(process.argv))
  .command(
    "[alg]",
    "Screenshot an alg. (You can specify an empty alg string.)",
    () => {},
    (argv) => {
      console.info(argv);
    },
  )
  .option("puzzle", {
    type: "string",
  })
  .option("stickering", {
    type: "string",
  })
  .option("anchor", {
    type: "string",
    choices: ["start", "end"],
  })
  .option("hint-facelets", {
    type: "string",
    choices: ["none", "floating"],
  })
  .option("visualization", {
    type: "string",
  })
  .option("debug", {
    type: "boolean",
  })
  .option("out-file", {
    type: "string",
  })
  .option("width", {
    type: "number",
    default: 2048,
  })
  .option("height", {
    type: "number",
    default: null,
    description: "Defaults to width",
  })
  .option("camera-latitude", {
    type: "number",
  })
  .option("camera-longitude", {
    type: "number",
  })
  .strictOptions()
  .demandCommand(1).argv;

args.alg = args._[0];

const options = {
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
  if (typeof options[key] === "undefined") {
    delete options[key];
  }
}

console.log(options);

options.background = "none";
options.controlPanel = "none";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const height = args["height"] ?? args["width"];
  page.setViewport({
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

  await browser.close();

  process.exit(0);
})();
