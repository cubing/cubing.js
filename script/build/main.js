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

import {
  default as configSrc,
  twizzleSnowpackConfig,
} from "../../snowpack.config.mjs";
import { execPromise } from "../lib/execPromise.js";
import { experimentsSnowpackConfig } from "../../snowpack.config.mjs";

const PARALLEL = false;

const externalNode = ["crypto", "worker_threads"];
const external = ["three", "comlink", ...externalNode];

export async function build(target, dev) {
  const startDeps = Date.now();
  const depPromises = [];
  for (const dependency of target.dependencies) {
    const depPromise = build(dependency, dev);
    depPromises.push(depPromise);
    if (!PARALLEL) {
      await depPromise;
    }
  }
  await Promise.all(depPromises);
  if (!target.builtYet) {
    const startSelf = Date.now();
    console.log("Building target:", target.name);
    await target.buildSelf(dev);
    const doneTimestamp = Date.now();
    const durTotalSeconds = Math.floor(doneTimestamp - startDeps) / 1000;
    const durDepsSeconds = Math.floor(startSelf - startDeps) / 1000;
    console.log(
      `Successfully built target in ${durTotalSeconds} seconds (${durDepsSeconds} spent in dependencies):`,
      target.name,
    );
    target.builtYet = true;
  }
}

function constructStringWrappingPlugin(dev) {
  return {
    name: "wrapping",
    setup(build) {
      build.onEnd((result) => {
        return new Promise(async (resolve, _) => {
          if (result.errors.length !== 0) {
            await execPromise(
              "rm -f src/cubing/search/worker-inside-generated.js",
            );

            if (dev) {
              writeFile(
                "src/cubing/search/worker-inside-generated-string.js",
                'export const workerSource = "throw new Error(\\"Worker build error.\\");";',
                () => {
                  console.log(
                    "Worker generation failed. Generated worker has been replaced with a stub.",
                  );
                  resolve();
                },
              );
            } else {
              await execPromise(
                "rm -f src/cubing/search/worker-inside-generated-string.js",
              );
              console.log(
                "Worker generation failed. Removed generated worker files.",
              );
            }
          } else {
            readFile(
              "src/cubing/search/worker-inside-generated.js",
              "utf8",
              (_, contents) => {
                writeFile(
                  "src/cubing/search/worker-inside-generated-string.js",
                  `export const workerSource = "${contents
                    .replace(/\\/g, "\\\\")
                    .replace(/"/g, '\\"')
                    .replace(/\n/g, "\\n")}";`,
                  async () => {
                    await execPromise(
                      "rm -f src/cubing/search/worker-inside-generated.js",
                    );
                    console.log("updated worker-inside-generated-string.js");
                    resolve();
                  },
                );
              },
            );
          }
        });
      });
    },
  };
}

export const searchWorkerTarget = {
  name: "search-worker",
  builtYet: false,
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["./src/cubing/search/inside/entry.js"],
      outfile: "./src/cubing/search/worker-inside-generated.js",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: dev,
      logLevel: "info",
      external: externalNode,
      minify: !dev,
      plugins: [constructStringWrappingPlugin(dev)],
    });
  },
};

export const bundleGlobalTarget = {
  name: "bundle-global",
  builtYet: false,
  dependencies: [searchWorkerTarget],
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

export const esmTarget = {
  name: "esm",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: [
        "src/cubing/alg/index.ts",
        "src/cubing/bluetooth/index.ts",
        "src/cubing/kpuzzle/index.ts",
        "src/cubing/notation/index.ts",
        "src/cubing/protocol/index.ts",
        "src/cubing/puzzle-geometry/index.ts",
        "src/cubing/puzzles/index.ts",
        "src/cubing/scramble/index.ts",
        "src/cubing/stream/index.ts",
        "src/cubing/search/index.ts",
        "src/cubing/twisty/index.ts",
        "src/cubing/esm-test-worker.js",
      ],
      outdir: "dist/esm",
      format: "esm",
      target: "es2020",
      bundle: true,
      splitting: true,
      watch: dev,
      logLevel: "info",
      sourcemap: true,
      //
      external,
    });
    await execPromise("cp -R src/static/* ./");
  },
};

export const binTarget = {
  name: "bin",
  builtYet: false,
  dependencies: [searchWorkerTarget],
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

export const sitesTarget = {
  name: "sites",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(configSrc);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

export const twizzleTarget = {
  name: "twizzle",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(twizzleSnowpackConfig);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

export const experimentsTarget = {
  name: "experiments",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(experimentsSnowpackConfig);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

export const typesTarget = {
  name: "types",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    console.warn(
      "Note: The `types` target uses `tsc`, which is slow. Expect ≈10 seconds or more.",
    );
    if (dev) {
      throw new Error("Cannot build `types` target in dev mode.");
    }
    await execPromise("npx tsc --build ./tsconfig-types.json");
  },
};

export const allTarget = {
  name: "all",
  builtYet: false,
  dependencies: [esmTarget, bundleGlobalTarget, typesTarget, binTarget],
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
  "search-worker": searchWorkerTarget,
  "sites": sitesTarget,
  "twizzle": twizzleTarget,
  "experiments": experimentsTarget,
  "bundle-global": bundleGlobalTarget,
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
  console.log("Finished building!");
  // TODO: Why does this script hang (non-deterministically?) if we don't exit here?
  if (!dev) {
    process.exit(0);
  }
})();
