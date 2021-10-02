import * as esbuild from "esbuild";
import { getEntryPoints } from "./glob.js";

// const currentServerResult = null;

const entryPoints = getEntryPoints();

esbuild.serve({
  entryPoints,
  outdir: "dist/esm",
  format: "esm",
  target: "es2020",
  bundle: true,
  splitting: true,
  watch: dev,
  logLevel: "info",
  sourcemap: true,
  //
  external,
});
