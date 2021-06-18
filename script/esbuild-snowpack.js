import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

export async function main(options) {
  const { dev } = options;

  const config = snowpack.createConfiguration({
    workspaceRoot: "/",
    mount: {
      "src/experiments/static": { url: "/", static: true },
      "src/experiments/code": { url: "/_code" },
    },
    packageOptions: {},
    devOptions: {
      port: 3333,
    },
    buildOptions: {
      out: "dist/experiments",
      baseUrl: "/cubing.js",
    },
    optimize: {
      bundle: true,
      splitting: true,
      minify: true,
      target: "es2020",
      sourcemap: false,
    },
  });

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
  await Promise.all([esbuildPromise, snowpackPromise]);
}
