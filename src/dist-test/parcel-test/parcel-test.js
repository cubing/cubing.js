import puppeteer from "puppeteer";
import { Alg } from "../../../dist/esm/alg/index.js";
import { installServer, port, startServer } from "./serve-parcel.js";

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
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  await page.goto(`http://localhost:${port}/`);
  const elem = await page.waitForSelector("#scramble-test");
  const textContent = await elem.evaluate((node) => node.textContent);
  console.log(textContent);
  const alg = Alg.fromString(textContent);
  const algLength = alg.experimentalNumUnits();
  assert("algLength > 12", true, algLength > 12);
  assert("algLength < 30", true, algLength < 30);
  if (OPEN_REPL) {
    globalThis.page = page;
    (await import("repl")).start();
  } else {
    await browser.close();
    process.exit(exitCode);
  }
}

(async () => {
  await installServer();
  startServer();
  runTest();
})();
