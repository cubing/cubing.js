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

import { barelyServe } from "barely-a-dev-server";
import * as esbuild from "esbuild";
import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { execPromise, spawnPromise } from "../lib/execPromise.js";
import { packageEntryPoints } from "../lib/packages.js";
import { writeSyncUsingTempFile } from "./temp.js";

const PARALLEL = false;
const PUBLISH_WITH_PRIVATE_FIELDS = true;

export const ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED = PUBLISH_WITH_PRIVATE_FIELDS
  ? {
      "class-private-accessor": true,
      "class-private-brand-check": true,
      "class-private-field": true,
      "class-private-method": true,
      "class-private-static-accessor": true,
      "class-private-static-field": true,
      "class-private-static-method": true,
    }
  : {};

const external = ["three", "comlink", "random-uint-below"];

function plugins(dev) {
  const plugins = [];
  // TODO: convenience hack for @lgarron; figure out how to either generalize this or add light auto-refresh to `barely-a-dev-server`
  if (
    dev &&
    process.env["EXPERIMENTAL_CUBING_JS_RELOAD_CHROME_MACOS"] === "1"
  ) {
    console.log(
      "\nEXPERIMENTAL_CUBING_JS_RELOAD_CHROME_MACOS is set. In dev mode, the current Chrome tab (if it begins with `http://[cubing.]localhost`) will refresh after every build.\n",
    );
    plugins.push({
      name: "refresh",
      setup(build) {
        build.onEnd(() => {
          exec(
            `osascript -e 'tell application "Google Chrome"
              set theURL to get URL of the active tab of its first window
              if theURL starts with "http://localhost" then
                tell the active tab of its first window to reload
              end if
              if theURL starts with "http://cubing.localhost" then
                tell the active tab of its first window to reload
              end if
            end tell'`,
          );
        });
      },
    });
  }
  return plugins;
}

function siteOptions(srcFolder, dev) {
  return {
    entryRoot: join("src", srcFolder),
    outDir: dev ? join(".temp/dev", srcFolder) : join("dist", srcFolder),
    dev,
    devDomain: "cubing.localhost",
    port: 3333,
    esbuildOptions: {
      target: "es2020",
      plugins: plugins(dev),
      minify: !dev,
      external: ["node:*"], // TODO
      supported: { ...ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED },
    },
  };
}

async function writeVersionJSON(siteFolder) {
  // https://git-scm.com/docs/git-describe
  const gitDescribeVersion = (
    await execPromise("git describe --tags || echo v0.0.0")
  ).trim();
  const gitBranch = (
    await execPromise("git rev-parse --abbrev-ref HEAD")
  ).trim();
  const date = (await execPromise("date")).trim();
  const commitHash = (await execPromise("git rev-parse HEAD")).trim();
  const commitGitHubURL = `https://github.com/cubing/cubing.js/commit/${commitHash}`;

  await writeFile(
    join(siteFolder, "version.json"),
    JSON.stringify(
      { gitDescribeVersion, gitBranch, date, commitHash, commitGitHubURL },
      null,
      "  ",
    ),
  );
}

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

let latestBuildSymbol = null;
const SEARCH_WORKER_PATH =
  "./src/cubing/search/search-worker-inside-generated-string.js";
export const searchWorkerTarget = {
  name: "search-worker",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    const buildSymbol = Symbol("esbuild");
    latestBuildSymbol = buildSymbol;

    const writeFile = async (buildResult) => {
      if (latestBuildSymbol !== buildSymbol) {
        console.warn("Stale `esbuild`?!");
        return;
      }
      const { contents } = buildResult.outputFiles[0];
      const contentsString = new TextDecoder("utf-8").decode(contents);
      if (typeof contentsString !== "string") {
        throw new Error(
          "Unexpected non-string for the decoded search worker source.",
        );
      }
      const workerContents = `export const workerSource = ${JSON.stringify(
        contentsString,
      )};`;
      console.log("Writing:", SEARCH_WORKER_PATH);
      writeSyncUsingTempFile(
        "search-worker-inside-generated-string.js",
        SEARCH_WORKER_PATH,
        workerContents,
      );
    };

    let watch = dev;
    if (dev) {
      watch = {
        onRebuild(error, result) {
          if (error) {
            console.error("Watch build failed:", error);
          } else {
            writeFile(result);
          }
        },
      };
    }

    const initialBuildResult = await esbuild.build({
      entryPoints: ["./src/cubing/search/inside/search-worker-js-entry.js"],
      format: "cjs",
      target: "es2020",
      bundle: true,
      watch,
      write: false,
      logLevel: "info",
      external: ["node:*"],
      minify: !dev,
    });
    // Note that we finish writing the initial built file before we return.
    // This means that the file is in place before any dependent steps(like Snowpack) start.
    await writeFile(initialBuildResult);
  },
};

export const staticPackageMetadataTarget = {
  name: "static-package-metadata",
  builtYet: false,
  dependencies: [],
  buildSelf: async (_) => {
    // TODO: use `fs/promises` once we can use a recent enough version of `node`.
    const exports = JSON.parse(await readFile("./package.json")).exports;
    for (const folder of Object.keys(exports)) {
      if (!(await existsSync(folder))) {
        await mkdir(folder);
      }
      const folderBasename = basename(folder);
      const subpackageJSON = {
        main: `../dist/esm/${folderBasename}/index.js`,
        types: `../dist/types/${folderBasename}/index.d.ts`,
      };
      const packageJSONFilePath = join(folder, "package.json");
      console.log(`Writing: ${packageJSONFilePath}`);
      await writeFile(
        packageJSONFilePath,
        JSON.stringify(subpackageJSON, null, "  "),
      );

      try {
        const typesJS = `export * from "../../types/${folderBasename}";\n`;
        const typesJSFolder = join("./dist/esm/", folder);
        const typesJSFilePath = join(typesJSFolder, "index.d.ts");
        if (!(await existsSync(typesJSFolder))) {
          await mkdir(typesJSFolder, { recursive: true });
        }
        console.log(`Writing: ${typesJSFilePath}`);
        await writeFile(typesJSFilePath, typesJS);
      } catch (e) {
        console.log(e);
      }
    }
  },
};

export const esmTarget = {
  name: "esm",
  builtYet: false,
  dependencies: [searchWorkerTarget, staticPackageMetadataTarget],
  buildSelf: async (dev) => {
    await esbuild.build({
      // TODO: construct entry points based on `exports` (see `staticPackageMetadataTarget`) and add tests.
      entryPoints: packageEntryPoints,
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
      supported: { ...ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED },
    });
  },
};

export const binTarget = {
  name: "bin",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: [
        "src/bin/order.ts",
        "src/bin/puzzle-geometry-bin.ts",
        "src/bin/import-restrictions-mermaid-diagram.ts",
      ],
      outdir: "dist/bin/",
      format: "esm",
      target: "es2020",
      bundle: true,
      watch: dev,
      logLevel: "info",
      sourcemap: dev,
      //
      external,
      supported: {
        ...ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED,
        "top-level-await": true,
      },
    });
  },
};

export const sitesTarget = {
  name: "sites",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    await barelyServe(siteOptions("sites", dev));
  },
};

export const twizzleTarget = {
  name: "twizzle",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    await barelyServe(siteOptions("sites/alpha.twizzle.net", dev));
    if (!dev) {
      // TODO: Include this in the custom build process.
      await writeVersionJSON("dist/sites/alpha.twizzle.net");
    }
  },
};

export const experimentsTarget = {
  name: "experiments",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    await barelyServe(
      siteOptions("sites/experiments.cubing.net/cubing.js", dev),
    );

    if (!dev) {
      // TODO: Include this in the custom build process.
      await writeVersionJSON("dist/sites/alpha.twizzle.net");
    }
  },
};

export const typesTarget = {
  name: "types",
  builtYet: false,
  dependencies: [searchWorkerTarget],
  buildSelf: async (dev) => {
    console.warn("Note: The `types` target is slow. Expect several seconds.");
    if (dev) {
      throw new Error("Cannot build `types` target in dev mode.");
    }
    await spawnPromise("npx", [
      "tsup",
      ...packageEntryPoints,
      "--dts-only",
      "--out-dir",
      "dist/types",
    ]);
  },
};

export const allTarget = {
  name: "all",
  builtYet: false,
  dependencies: [esmTarget, typesTarget, binTarget],
  buildSelf: async (dev) => {
    if (dev) {
      throw new Error("Cannot build `types` target in dev mode.");
    }
  },
};

export const targets /*: Record<String, SolverWorker>*/ = {
  "search-worker": searchWorkerTarget,
  sites: sitesTarget,
  twizzle: twizzleTarget,
  experiments: experimentsTarget,
  "static-package-metadata": staticPackageMetadataTarget,
  esm: esmTarget,
  types: typesTarget,
  bin: binTarget,
  all: allTarget,
};
