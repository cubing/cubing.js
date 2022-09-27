#!/usr/bin/env node

import { build } from "esbuild";
import { execPromise } from "../lib/execPromise.js";

const TS_FILE = new URL("./screenshot-src/main.ts", import.meta.url).pathname;
const JS_FILE = new URL("./screenshot-src/main.js", import.meta.url).pathname;

await execPromise("make build-sites"); // TODO: can we detect when *not* to run this?
await build({
  format: "esm",
  entryPoints: [TS_FILE],
  outfile: JS_FILE,
});
import(JS_FILE);
