import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import configSrc from "../snowpack.config.mjs";
import { execPromise } from "./execPromise.js";

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

export const SolveWorkerTarget = {
  builtYet: false,
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["src/cubing/solve/worker/worker-inside-src.ts"],
      outfile: "src/cubing/solve/worker/worker-inside-generated.cjs",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: dev,
      logLevel: "info",
    });
  },
};

export const BundleGlobalTarget = {
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
      external: ["three", "web-worker"],
    });
    await execPromise("cp -R src/dist-static/cjs/* dist/cjs");
  },
};

// npm run build-worker; npx esbuild
// --target=es2020
// --bundle
// --external:three
// --external:web-worker
// --splitting
// --format=esm
// --sourcemap
// --outdir=dist/esm src/cubing/index.ts src/cubing/alg/index.ts src/cubing/bluetooth/index.ts src/cubing/kpuzzle/index.ts src/cubing/protocol/index.ts src/cubing/puzzle-geometry/index.ts src/cubing/puzzles/index.ts src/cubing/scramble/index.ts src/cubing/stream/index.ts src/cubing/solve/index.ts src/cubing/twisty/index.ts && cp -R src/dist-static/esm/* dist/esm && cp src/cubing/solve/worker/worker-inside-generated.cjs dist/esm/worker-inside-generated.cjs
export const esmTarget = {
  builtYet: false,
  dependencies: [],
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
      external: ["three", "web-worker"],
    });
    await execPromise("cp -R src/dist-static/esm/* dist/esm");
    await execPromise(
      "cp src/cubing/solve/worker/worker-inside-generated.cjs dist/esm/worker-inside-generated.cjs",
    );
  },
};

export const SnowpackTarget = {
  builtYet: false,
  dependencies: [SolveWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(configSrc);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

const targetName = process.argv[2];
if (!targetName) {
  console.error("not a target:", targetName);
  process.exit(1);
}

const dev = process.argv[3] === "dev";

const targets /*: Record<String, SolverWorker>*/ = {
  "solve-worker": SolveWorkerTarget,
  "snowpack": SnowpackTarget,
  "bundle-global": BundleGlobalTarget,
  "cjs": cjsTarget,
  "esm": esmTarget,
};

(async () => {
  const target = targets[targetName];
  if (!target) {
    console.error("Unknown target:", targetName);
    process.exit(1);
  }
  await build(target, dev);
})();
