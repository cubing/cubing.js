import { env } from "node:process";
import { chromium } from "playwright";
import { startServer } from "../../../../lib/experiments-server/index.js";

const OPEN_REPL = env["OPEN_REPL_FOR_BROWSER_TESTS"] === "true"; // Set to `true` for testing.
const HEADLESS = !OPEN_REPL; // TODO: doesn't work?

if (!OPEN_REPL) {
  console.error(`To test with a repl and browser, run:

    env OPEN_REPL_FOR_BROWSER_TESTS=true make test-dist-sites-twizzle

`);
}

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
  const browser = await chromium.launch({
    headless: HEADLESS,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setViewportSize({
    width: 1024,
    height: 1024,
  });

  await page.goto("http://localhost:4443/alpha.twizzle.net/explore/?alg=R");
  // await page.screenshot({
  //   path: "out.png",
  //   omitBackground: true,
  //   fullPage: true,
  // });

  await page.evaluate(() => {
    globalThis.app.setPuzzleName("2x2x2");
  });

  const puzzle = new URL(page.url()).searchParams.get("puzzle");
  assert("Puzzle is set in the URL parameter", "2x2x2", puzzle);

  await Promise.all([
    page.waitForNavigation(),
    page.selectOption("#puzzle-name", "4x4x4"),
  ]);

  assert(
    "New puzzle is set in the URL parameter",
    "4x4x4",
    new URL(page.url()).searchParams.get("puzzle"),
  );

  async function numCanvases() {
    return page.evaluate(async () => {
      return (
        await document
          .querySelector("twisty-player")
          .experimentalCurrentCanvases()
      ).length;
    });
  }

  await page.goto("http://localhost:4443/alpha.twizzle.net/edit/?puzzle=clock");
  assert("no canvas loaded initially", 0, await numCanvases());
  await (await page.waitForSelector(".puzzle")).selectOption("3x3x3");
  assert("canvas loaded after switching to 3×3×3", 1, await numCanvases());

  if (OPEN_REPL) {
    globalThis.page = page;
    (await import("node:repl")).start();
  } else {
    await browser.close();
    process.exit(exitCode);
  }

  // await page.screenshot({
  //   path: "out.png",
  //   omitBackground: true,
  //   fullPage: true,
  // });
}

startServer();
runTest();
