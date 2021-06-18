import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import configSrc from "../snowpack.config.mjs";

export async function main(options) {
  const { dev, workerOnly } = options;

  const config = snowpack.createConfiguration(configSrc);

  const esbuildPromise = esbuild.build({
    entryPoints: ["src/cubing/solve/worker/worker-inside-src.ts"],
    outfile: "src/cubing/solve/worker/worker-inside-generated.cjs",
    format: "cjs",
    target: "es2015",
    bundle: true,
    watch: dev,
    logLevel: "info",
  });

  await esbuildPromise;

  if (!workerOnly) {
    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  }
}
