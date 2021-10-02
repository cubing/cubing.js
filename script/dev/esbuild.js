import * as esbuild from "esbuild";
import glob from "glob";
import { join } from "path";
import { listFilesWithSuffix } from "./ls.js";

let currentBuildResult = null;

export function getEntryPoints() {
  return glob.sync("src/sites/**/*.ts");
}

export async function restartEsbuild(entryRootPath, outputRootPath) {
  if (currentBuildResult) {
    (await currentBuildResult).stop();
  }
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
