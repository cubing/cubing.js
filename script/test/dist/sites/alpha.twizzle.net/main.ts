import { env } from "node:process";
import { chromium, type Page } from "playwright";
import type { TwistyPlayer } from "../../../../../src/cubing/twisty";
import type { TwizzleExplorerApp } from "../../../../../src/sites/alpha.twizzle.net/explore/app";
import { startServer } from "../../../../lib/experiments-server";

const OPEN_REPL = env["OPEN_REPL_FOR_BROWSER_TESTS"] === "true"; // Set to `true` for testing.
const HEADLESS = !OPEN_REPL; // TODO: doesn't work?

if (!OPEN_REPL) {
  console.error(`To test with a repl and browser, run:

    env OPEN_REPL_FOR_BROWSER_TESTS=true make test-dist-sites-twizzle

`);
}

let exitCode = 0;
function assert<T>(description: string, expected: T, observed: T) {
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
    (
      globalThis as typeof globalThis & { app: TwizzleExplorerApp }
    ).app.setPuzzleName("2x2x2");
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
          .querySelector<TwistyPlayer>("twisty-player")!
          .experimentalCurrentCanvases()
      ).length;
    });
  }

  await page.goto("http://localhost:4443/alpha.twizzle.net/edit/?puzzle=clock");
  assert("no canvas loaded initially", 0, await numCanvases());
  await (await page.waitForSelector(".puzzle")).selectOption("3x3x3");
  assert("canvas loaded after switching to 3×3×3", 1, await numCanvases());

  if (OPEN_REPL) {
    (globalThis as typeof globalThis & { page: Page }).page = page;
    // TODO: not implemented in `bun`: https://bun.com/reference/node/repl
    // Maintaining JS (rather than TS) versions of this script and its
    // dependencies is a pain, but maybe we can bundle a one-off transpilation
    // of this script for `node` when needed.
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
