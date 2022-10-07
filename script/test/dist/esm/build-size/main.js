import { build } from "esbuild";
import { mkdtemp, readFile, stat } from "fs/promises";
import { join } from "path";
import { promisify } from "util";
import { gzip } from "zlib";
import { needFolder } from "../../../../lib/need-folder.js";
import { ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED } from "../../../../build/targets.js"; // TODO: Factor out into the lib dir?

import { default as packageJSON } from "../../../../../package.json" assert {
  type: "json",
};
const { exports } = packageJSON;

const rootPath = new URL("../../../../../", import.meta.url);

needFolder(join(rootPath.pathname, "dist/esm"), "make build-esm");

function subpackageEntry(subpackageName) {
  return new URL(exports[`./${subpackageName}`].import, rootPath).pathname;
}

async function bundleSize(entryFile, threeExternal = false) {
  const tempDir = await mkdtemp("/tmp/build-size-");
  const outfile = join(tempDir, "bundle.js");
  await build({
    entryPoints: [entryFile],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2020",
    outfile,
    external: threeExternal ? ["three"] : [],
    supported: ESM_CLASS_PRIVATE_ESBUILD_SUPPORTED,
  });
  const { size } = await stat(outfile);
  const bundleContents = await readFile(outfile);
  const gzippedSize = (await promisify(gzip)(bundleContents)).length;
  return { size, gzippedSize };
}

function humanSize(numBytes) {
  return typeof numBytes === "number"
    ? `     ${Math.round(numBytes / 1000)}kB`.slice(-6)
    : numBytes;
}

function mapValues(s) {
  return Object.fromEntries(
    Object.entries(s).map(([k, v]) => [k, humanSize(v)]),
  );
}

const CONSOLE_PATH = new URL("./src/total.js", import.meta.url).pathname;

async function bundleSizeSummary(s) {
  const path = s === "(total)" ? CONSOLE_PATH : subpackageEntry(s);
  const [bundleSizeWithThree, bundleSizeNoTHREE] = await Promise.all([
    bundleSize(path),
    bundleSize(path, true),
  ]);
  return [
    s,
    mapValues({
      size: bundleSizeWithThree.size,
      sizeNoTHREE:
        bundleSizeWithThree.size === bundleSizeNoTHREE.size
          ? ""
          : bundleSizeNoTHREE.size,
      gzippedSize: bundleSizeWithThree.gzippedSize,
      gzippedSizeNoTHREE:
        bundleSizeWithThree.gzippedSize === bundleSizeNoTHREE.gzippedSize
          ? ""
          : bundleSizeNoTHREE.gzippedSize,
    }),
  ];
}

const subpackages = [
  "alg",
  "bluetooth",
  "kpuzzle",
  "notation",
  "protocol",
  "puzzle-geometry",
  "puzzles",
  "scramble",
  "search",
  "stream",
  "twisty",
  "(total)",
];

const results = {
  ...Object.fromEntries(
    await Promise.all(subpackages.map((s) => bundleSizeSummary(s, true))),
  ),
};
console.table(results);

// TODO: Design actual tests, and take bundle splitting into account.

if (results["twisty"].gzippedSize > 300_000) {
  throw new Error("❌ Gzipped `cubing/twisty` build size is over 300mB");
} else {
  console.log("✅ Gzipped `cubing/twisty` build size is ≤ 300mB");
}

if (results["(total)"].size > 2_000_000) {
  throw new Error("❌ Total (uncompressed) build size is over 2mB");
} else {
  console.log("✅ Total (uncompressed) build size is ≤ 2mB");
}
