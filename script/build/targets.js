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
  libExternal,
  packageEntryPoints,
  packageEntryPointsWithSearchWorkerEntry,
  searchWorkerEsbuildWorkaroundEntry,
} from "./common/package-info.js";

const PARALLEL = false;

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

export const esmOptions = {
  // TODO: construct entry points based on `exports` and add tests.
  entryPoints: packageEntryPointsWithSearchWorkerEntry,
  outdir: "dist/lib/cubing",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2020",
  bundle: true,
  splitting: true,
  logLevel: "info",
  sourcemap: true,
  //
  external: libExternal,
  metafile: true,
};

export const esmTarget = {
  name: "esm",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {
    const build = await esbuild.build(esmOptions);

    await mkdir("./.temp", { recursive: true });
    await writeFile(
      "./.temp/esbuild-metafile.json",
      JSON.stringify(build.metafile),
    );
  },
};

export const typesTarget = {
  name: "types",
  builtYet: false,
  dependencies: [],
  buildSelf: async (dev) => {},
};

export const targets /*: Record<String, SolverWorker>*/ = {
  sites: sitesTarget,
  twizzle: twizzleTarget,
  experiments: experimentsTarget,
  esm: esmTarget,
  types: typesTarget,
};
