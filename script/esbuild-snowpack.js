import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import configSrc from "../snowpack.config.mjs";

export async function main(options) {
  const { dev } = options;

  const config = snowpack.loadConfiguration(configSrc);

  const esbuildPromise = esbuild.build({
    entryPoints: ["src/cubing/solve/worker/inside/src/worker-inside.ts"],
    outfile: "src/cubing/solve/worker/inside/generated/worker-inside.js",
    format: "cjs",
    target: "es2015",
    bundle: true,
    watch: dev,
    logLevel: "info",
  });

  await esbuildPromise;

  const snowpackPromise = dev
    ? snowpack.startServer({ config }, { isDev: dev })
    : snowpack.build({ config });
  await snowpackPromise;
}
