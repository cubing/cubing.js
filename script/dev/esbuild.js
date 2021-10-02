import * as esbuild from "esbuild";
import glob from "glob";

let currentBuildResult = null;

export function getEntryPoints() {
  return glob.sync("src/sites/**/*.ts");
}

export async function restartEsbuild() {
  if (currentBuildResult) {
    (await currentBuildResult).stop();
  }
  const entryPoints = getEntryPoints();
  console.log(
    `Starting esbuild in watch mode with ${entryPoints.length} entry points.`,
  );
  currentBuildResult = esbuild.build({
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
