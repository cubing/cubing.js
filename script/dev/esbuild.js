import * as esbuild from "esbuild";
import { join } from "path";
import { build, searchWorkerTarget } from "../build/index.js";
import { listFilesWithSuffix } from "./ls.js";

let currentBuildResult = null;

export async function restartEsbuild(entryRootPath, outputRootPath) {
  if (currentBuildResult) {
    (await currentBuildResult).stop();
  }

  await build(searchWorkerTarget, true);

  const entryPoints = await listFilesWithSuffix(
    join(process.cwd(), entryRootPath),
    ".ts",
  );
  console.log(
    `Starting esbuild in watch mode with ${entryPoints.length} entry points.`,
  );
  currentBuildResult = esbuild.build({
    entryPoints,
    outdir: outputRootPath,
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
