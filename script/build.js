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

import configSrc from "../snowpack.config.mjs";
import { execPromise } from "./execPromise.js";

const externalNode = ["crypto", "worker_threads"];
const external = ["three", "web-worker", ...externalNode];

export async function build(target, dev) {
  const depPromises = target.dependencies.map((dependency) =>
    build(dependency, dev),
  );
  await depPromises;
  if (!target.builtYet) {
    await target.buildSelf(dev);
    target.builtYet = true;
  }
}

export const solveWorkerTarget = {
  builtYet: false,
  dependencies: [],
  buildSelf: (dev) => {
    console.log(
      "\nsolveWorkerTarget\nsolveWorkerTarget\nsolveWorkerTarget\nsolveWorkerTarget\nsolveWorkerTarget\nsolveWorkerTarget\nsolveWorkerTarget",
    );
    return esbuild.build({
      entryPoints: [
        "./src/cubing/solve/worker/vendor/entries/esm/scrambles-worker.js",
      ],
      outfile:
        "./src/cubing/solve/worker/vendor/entries/esm/worker-inside-generated.js",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: dev,
      logLevel: "info",
      external: externalNode,
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

    await execPromise(
      "cp ./cubing/solve/worker/vendor/entries/esm/worker-inside-generated.js dist/cjs/worker-inside-generated.js",
    );
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
    await new Promise((resolve) => {
      // TODO: this sleep is a workaround for @lgarron's Big Sur filesystem issues.
      setTimeout(resolve, 100);
    });
    await execPromise(
      "cp ./cubing/solve/worker/vendor/entries/esm/worker-inside-generated.js dist/esm/solve/worker-inside-generated.js",
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
  dependencies: [], // solve worker?
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
