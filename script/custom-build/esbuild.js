import * as esbuild from "esbuild";
import { join } from "path";
import { listFilesWithSuffix } from "./ls.js";

let currentBuildResult = null;

export async function restartEsbuild(entryRootPath, outputRootPath, dev) {
  if (currentBuildResult) {
    (await currentBuildResult).stop();
  }

  const entryPoints = await listFilesWithSuffix(
    join(process.cwd(), entryRootPath),
    ".ts",
  );
  console.log(
    `Starting esbuild with ${entryPoints.length} entry points.`,
  );
  return currentBuildResult = esbuild.build({
    entryPoints,
    outdir: outputRootPath,
    format: "esm",
    target: "es2020",
    bundle: true,
    splitting: true,
    watch: dev,
    logLevel: "info",
    sourcemap: true,
    external: ["crypto", "worker_threads"],
    minify: true, // TODO: `!dev`?
  });
}
