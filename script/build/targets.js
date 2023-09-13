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
import {
  packageEntryPoints,
  packageEntryPointsWithSearchWorkerEntry,
  searchWorkerEsbuildWorkaroundEntry,
} from "../lib/packages.js";

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

// TODO(https://github.com/yargs/yargs/issues/2358): If `yargs` adopts `node:` prefixes we don't have to enumerate these.
const YARGS_NODE_EXTERNALS = ["path", "url", "fs", "util", "assert"];

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

export const esmTarget = {
  name: "esm",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    const build = await esbuild.build({
      // TODO: construct entry points based on `exports` and add tests.
      entryPoints: packageEntryPointsWithSearchWorkerEntry,
      outdir: "dist/lib/cubing",
      format: "esm",
      target: "es2020",
      bundle: true,
      splitting: true,
      logLevel: "info",
      sourcemap: true,
      //
      external,
      supported: { ...ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED },
      metafile: true,
    });

    await mkdir("./.temp", { recursive: true });
    await writeFile(
      "./.temp/esbuild-metafile.json",
      JSON.stringify(build.metafile),
    );
  },
};

export const binTarget = {
  name: "bin",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: [
        "src/bin/order.ts",
        "src/bin/puzzle-geometry-bin.ts",
        "src/bin/import-restrictions-mermaid-diagram.ts",
        "src/bin/scramble.ts",
        searchWorkerEsbuildWorkaroundEntry,
      ],
      outdir: "dist/bin/",
      chunkNames: "chunks/[name]-[hash]",
      format: "esm",
      target: "es2020",
      bundle: true,
      logLevel: "info",
      sourcemap: dev,
      splitting: true, // We need this so that `search-worker-entry.js` exists in the output and can be used by other binaries without importing duplicate copies of some code.
      //
      external: [...external, ...YARGS_NODE_EXTERNALS],
      supported: {
        ...ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED,
        "top-level-await": true,
      },
      banner: {
        js: "#!/usr/bin/env node",
      },
    });
    // Note: the output entry files are `chmod`ded by the `Makefile`.
  },
};

export const sitesTarget = {
  name: "sites",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    await barelyServe(siteOptions("sites", dev));
  },
};

export const twizzleTarget = {
  name: "twizzle",
  builtYet: false,
  dependencies: [],
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
  dependencies: [],
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
  dependencies: [],
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
      "dist/lib/cubing",
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
  sites: sitesTarget,
  twizzle: twizzleTarget,
  experiments: experimentsTarget,
  esm: esmTarget,
  types: typesTarget,
  bin: binTarget,
  all: allTarget,
};
