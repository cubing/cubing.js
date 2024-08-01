#!/usr/bin/env node

// TODO(https://github.com/cubing/cubing.js/issues/294): switch to `bun` once it supports Playwright.

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { execPromise } from "../lib/execPromise.js";

const TS_FILE = fileURLToPath(
  new URL("./screenshot-src/main.ts", import.meta.url),
);
const JS_FILE = fileURLToPath(
  new URL("./screenshot-src/main.js", import.meta.url),
);

await execPromise("make build-sites"); // TODO: can we detect when *not* to run this?
await build({
  format: "esm",
  entryPoints: [TS_FILE],
  outfile: JS_FILE,
});
import(JS_FILE);
