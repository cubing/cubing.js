import * as esbuild from "esbuild";
import { getEntryPoints } from "./glob.js";

let currentServerResult = null;

export async function restartEsbuild() {
  if (currentServerResult) {
    (await currentServerResult).stop();
  }
  const entryPoints = getEntryPoints();
  console.log(
    `Starting esbuild in watch mode with ${entryPoints.length} entry points.`,
  );
  currentServerResult = esbuild.build({
    entryPoints,
    outdir: "dist/dev/esbuild",
    format: "esm",
    // target: "es2020",
    bundle: true,
    splitting: true,
    watch: true,
    logLevel: "info",
    sourcemap: true,
    external: ["crypto", "worker_threads"],
  });
}
