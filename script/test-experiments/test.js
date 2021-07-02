import puppeteer from "puppeteer";
import { startServer } from "../experiments-server/index.js";

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

  await page.goto("http://localhost:4443/cubing.js/twizzle/index.html?alg=R");
  // await page.screenshot({
  //   path: "out.png",
  //   omitBackground: true,
  //   fullPage: true,
  // });

  const puzzle = new URL(page.url()).searchParams.get("puzzle");
  assert("Default puzzle is set in the URL parameter", "3x3x3", puzzle);

  assert(
    "Time range is correct",
    1000,
    await page.$eval("twisty-player", (elem) => elem.timeline.timeRange().end),
  );

  await Promise.all([
    page.waitForNavigation(),
    page.select("#puzzleoptions", "o f 0.333333333333333"),
  ]);

  assert(
    "New puzzle is set in the URL parameter",
    "FTO",
    new URL(page.url()).searchParams.get("puzzle"),
  );

  await page.$eval("textarea", (elem) => (elem.value = "BADMOVE"));
  await page.waitForTimeout(100);

  assert(
    "Alg is marked as bad.",
    "rgb(255, 128, 128)",
    await page.$eval("textarea", (elem) => elem.style.backgroundColor),
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
