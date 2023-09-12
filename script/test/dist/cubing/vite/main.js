import { needFolder } from "../../../../lib/need-folder.js";
needFolder(
  new URL("../../../../../dist/npm/cubing/kpuzzle", import.meta.url).pathname,
  "make build-esm",
);

import { chromium } from "playwright";
import { installServer, port, startServer } from "./serve-vite.js";
import { killAllChildProcesses } from "../../../../lib/execPromise.js";

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
  const browser = await chromium.launch({
    headless: HEADLESS,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setViewportSize({
    width: 1024,
    height: 1024,
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  await page.goto(`http://localhost:${port}/`);
  const elem = await page.waitForSelector("#scramble-test");
  const textContent = await elem.evaluate((node) => node.textContent);
  console.log("Generated scramble:", textContent);
  const alg = (await import("cubing/alg")).Alg.fromString(textContent);
  const algLength = alg.experimentalNumChildAlgNodes();
  assert("algLength > 12", true, algLength > 12);
  assert("algLength < 30", true, algLength < 30);
  if (OPEN_REPL) {
    globalThis.page = page;
    (await import("repl")).start();
  } else {
    await browser.close();
  }
}

(async () => {
  try {
    console.log("Installing Vite server dependencies.");
    await installServer();
    console.log("Starting Vite server.");
    // TODO: show zombie process info only on child process failure.
    startServer();
    console.log("Running test.\n");
    await runTest();
    console.log("Finished test.");
  } catch (e) {
    console.error(e);
    exitCode = 1;
  } finally {
    killAllChildProcesses();
    process.exit(exitCode);
  }
})();
