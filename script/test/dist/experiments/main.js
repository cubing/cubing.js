import puppeteer from "puppeteer";
import { startServer } from "../../../lib/experiments-server/index.js";
import { ensureChromiumDownload } from "../../../lib/puppeteer.js";

await ensureChromiumDownload();

const OPEN_REPL = false; // Set to `true` for testing.
const HEADLESS = !OPEN_REPL;

let exitCode = 0;
function assert(description, expected, observed) {
  if (expected === observed) {
    console.log(`✅ ${description}`);
  } else {
    console.error(
      `❌ ${description}\n↪ Expected: ${expected}\n↪ Observed: ${observed}`,
    );
    exitCode = 1;
  }
}

async function runTest() {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1024,
    height: 1024,
  });

  await page.goto("http://localhost:4443/alpha.twizzle.net/explore/?alg=R");
  // await page.screenshot({
  //   path: "out.png",
  //   omitBackground: true,
  //   fullPage: true,
  // });

  await page.$eval("twisty-player", (elem) => (elem.puzzle = "2x2x2"));

  await page.waitForNavigation();

  const puzzle = new URL(page.url()).searchParams.get("puzzle");
  assert("Puzzle is set in the URL parameter", "2x2x2", puzzle);

  await Promise.all([
    page.waitForNavigation(),
    page.select("#puzzleoptions", "o f 0.333333333333333"),
  ]);

  assert(
    "New puzzle is set in the URL parameter",
    "FTO",
    new URL(page.url()).searchParams.get("puzzle"),
  );

  if (OPEN_REPL) {
    globalThis.page = page;
    (await import("repl")).start();
  } else {
    await browser.close();
    process.exit(exitCode);
  }
}

startServer();
runTest();
