import { build } from "esbuild";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { gzip } from "zlib";
import { needPath } from "../../../../../lib/needPath.js";

import { default as packageJSON } from "../../../../../../package.json" assert {
  type: "json",
};
const { exports } = packageJSON;

const rootPath = new URL("../../../../../../", import.meta.url);

needPath(join(rootPath.pathname, "dist/lib/cubing"), "make build-lib-js");

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
    target: "es2022",
    outfile,
    external: threeExternal ? ["three"] : [],
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
  const sizes = {
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
  };
  return {
    name: s,
    sizes: sizes,
    humanSizes: mapValues(sizes),
  };
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

const summaries = await Promise.all(
  subpackages.map((s) => bundleSizeSummary(s)),
);
const valueResults = {
  ...Object.fromEntries(
    summaries.map((summary) => [summary.name, summary.sizes]),
  ),
};
const humanResults = {
  ...Object.fromEntries(
    await Promise.all(
      summaries.map((summary) => [summary.name, summary.humanSizes]),
    ),
  ),
};

// TODO: Design actual tests, and take bundle splitting into account.

if (valueResults["twisty"].gzippedSize > 300_000) {
  throw new Error("❌ Gzipped `cubing/twisty` build size is over 300kB");
} else {
  console.log("✅ Gzipped `cubing/twisty` build size is ≤ 300kB");
}

if (valueResults["twisty"].gzippedSizeNoTHREE > 128_000) {
  throw new Error(
    "❌ Gzipped no-THREE `cubing/twisty` build size is over 128kB",
  );
} else {
  console.log("✅ Gzipped no-THREE `cubing/twisty` build size is ≤ 100kB");
}

if (valueResults["puzzles"].gzippedSizeNoTHREE > 100_000) {
  throw new Error("❌ Gzipped `cubing/puzzles` build size is over 100kB");
} else {
  console.log("✅ Gzipped `cubing/puzzles` build size is ≤ 100kB");
}

if (valueResults["search"].size > 2_000_000) {
  throw new Error("❌ Total (uncompressed) build size is over 2mB");
} else {
  console.log("✅ Total (uncompressed) build size is ≤ 2mB");
}

if (valueResults["(total)"].size > 3_000_000) {
  throw new Error("❌ Total (uncompressed) build size is over 2mB");
} else {
  console.log("✅ Total (uncompressed) build size is ≤ 2mB");
}
