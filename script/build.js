// This file was created because:
//
// - Safari and Firefox don't support `module` workers yet.
// - `esbuild` and `snowpack` don't automatically handle transpilation to
//   `classic` web workers.
// - Parcel has too many show-stopping bugs for us to use.
//
// Once Safari and Firefox support module workers, we can hopefully revert to
// short commandline commands. But maybe this file will stick around because it
// turns out to be too useful.

import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import { readFile, writeFile } from "fs";

import configSrc from "../snowpack.config.mjs";
import { execPromise } from "./execPromise.js";

const externalNode = ["crypto", "worker_threads"];
const external = ["three", "web-worker", ...externalNode];

export async function build(target, dev) {
  const depPromises = target.dependencies.map((dependency) =>
    build(dependency, dev),
  );
  await Promise.all(depPromises);
  if (!target.builtYet) {
    await target.buildSelf(dev);
    target.builtYet = true;
  }
}

const stringWrappingPlugin = {
  name: "wrapping",
  setup(build) {
    build.onEnd((result) => {
      return new Promise((resolve /*reject*/) => {
        if (result.errors.length !== 0) {
          execPromise(
            "rm src/cubing/solve/worker/worker-inside-generated-string.cjs",
          );
          console.log("removed worker-inside-generated-string.cjs");
          resolve();
        }
        readFile(
          "src/cubing/solve/worker/worker-inside-generated.js",
          "utf8",
          (_, contents) => {
            writeFile(
              "src/cubing/solve/worker/worker-inside-generated-string.cjs",
              contents,
              // `export const workerSource = "${contents
              // .replaceAll("\\", "\\\\")
              // .replaceAll('"', '\\"')
              // .replaceAll("\n", "\\n")}";`,
              async () => {
                console.log("updated worker-inside-generated-string.cjs");
                resolve();
              },
            );
          },
        );
      });
    });
  },
};

export const solveWorkerTarget = {
  builtYet: false,
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: [
        "./src/cubing/solve/worker/vendor/entries/esm/scrambles-worker.js",
      ],
      outfile: "./src/cubing/solve/worker/worker-inside-generated.js",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: dev,
      logLevel: "info",
      external: externalNode,
      minify: true, // TODO: prod only?
      plugins: [stringWrappingPlugin],
    });
  },
};

export const bundleGlobalTarget = {
  builtYet: false,
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["src/cubing/cubing.bundle-global.ts"],
      outfile: "dist/bundle-global/cubing.bundle-global.js",
      format: "cjs",
      target: "es2020",
      bundle: true,
      minify: true,
      watch: dev,
      logLevel: "info",
      external: externalNode,
    });
  },
};

export const cjsTarget = {
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: ["src/cubing/index.ts"],
      outfile: "dist/cjs/index.js",
      format: "cjs",
      target: "es2020",
      bundle: true,
      watch: dev,
      logLevel: "info",
      //
      external,
    });
    await execPromise("cp -R src/dist-static/cjs/* dist/cjs");
  },
};

export const esmTarget = {
  builtYet: false,
  dependencies: [solveWorkerTarget],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: [
        "src/cubing/alg/index.ts",
        "src/cubing/bluetooth/index.ts",
        "src/cubing/kpuzzle/index.ts",
        "src/cubing/protocol/index.ts",
        "src/cubing/puzzle-geometry/index.ts",
        "src/cubing/puzzles/index.ts",
        "src/cubing/scramble/index.ts",
        "src/cubing/stream/index.ts",
        "src/cubing/solve/index.ts",
        "src/cubing/twisty/index.ts",
      ],
      outdir: "dist/esm",
      format: "esm",
      target: "es2020",
      bundle: true,
      watch: dev,
      logLevel: "info",
      sourcemap: true,
      //
      external,
    });
    await execPromise("cp -R src/dist-static/esm/* dist/esm");
    await execPromise(
      "cp src/cubing/solve/worker/worker-inside-generated-string.cjs dist/esm/solve/worker-inside-generated-string.cjs",
    );
  },
};

export const binTarget = {
  builtYet: false,
  dependencies: [solveWorkerTarget],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: ["src/bin/puzzle-geometry-bin.ts"],
      outfile: "dist/bin/puzzle-geometry-bin.js",
      format: "esm",
      target: "es2020",
      bundle: true,
      watch: dev,
      logLevel: "info",
      sourcemap: true,
      //
      external,
    });
  },
};

export const SnowpackTarget = {
  builtYet: false,
  dependencies: [solveWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(configSrc);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

export const typesTarget = {
  builtYet: false,
  dependencies: [solveWorkerTarget], // solve worker?
  buildSelf: async (dev) => {
    if (dev) {
      throw new Error("Cannot build `types` target in dev mode.");
    }
    await execPromise("npx tsc --build ./tsconfig-types.json");
  },
};

export const allTarget = {
  builtYet: false,
  dependencies: [
    esmTarget,
    cjsTarget,
    bundleGlobalTarget,
    typesTarget,
    binTarget,
  ],
  buildSelf: async (dev) => {
    if (dev) {
      throw new Error("Cannot build `types` target in dev mode.");
    }
  },
};

const targetName = process.argv[2];
if (!targetName) {
  console.error("not a target:", targetName);
  process.exit(1);
}

const dev = process.argv[3] === "dev";

const targets /*: Record<String, SolverWorker>*/ = {
  "solve-worker": solveWorkerTarget,
  "snowpack": SnowpackTarget,
  "bundle-global": bundleGlobalTarget,
  "cjs": cjsTarget,
  "esm": esmTarget,
  "types": typesTarget,
  "bin": binTarget,
  "all": allTarget,
};

(async () => {
  const target = targets[targetName];
  if (!target) {
    console.error("Unknown target:", targetName);
    process.exit(1);
  }
  await build(target, dev);
})();
