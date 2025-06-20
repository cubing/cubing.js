import { mkdtemp, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import { build } from "esbuild";
import { default as packageJSON } from "../../../../../../package.json" with {
  type: "json",
};
import { needPath } from "../../../../../lib/needPath.js";

const { exports } = packageJSON;

const rootFilePath = new URL("../../../../../../", import.meta.url);

needPath(
  join(fileURLToPath(rootFilePath), "dist/lib/cubing"),
  "make build-lib-js",
);

function subpackageEntry(subpackageName) {
  return fileURLToPath(
    new URL(exports[`./${subpackageName}`].import, rootFilePath),
  );
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
    external: threeExternal ? ["three/src/*"] : [],
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

const CONSOLE_PATH = fileURLToPath(new URL("./src/total.js", import.meta.url));

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
// const humanResults = {
//   ...Object.fromEntries(
//     await Promise.all(
//       summaries.map((summary) => [summary.name, summary.humanSizes]),
//     ),
//   ),
// };

// TODO: Design actual tests, and take bundle splitting into account.

const BYTES_PER_KILOBYTE = 1000;
function check(description: string, value: number, maxKilobytes: number) {
  if (value > maxKilobytes * BYTES_PER_KILOBYTE) {
    throw new Error(
      `❌ ${description} build size (${value / BYTES_PER_KILOBYTE}) is over ${maxKilobytes}kB.`,
    );
  } else {
    console.log(
      `✅ ${description} build size (${value / BYTES_PER_KILOBYTE}) is ≤ ${maxKilobytes}kB.`,
    );
  }
}

check("Gzipped `cubing/twisty`", valueResults["twisty"].gzippedSize, 275);
check(
  "Gzipped no-THREE `cubing/twisty`",
  valueResults["twisty"].gzippedSizeNoTHREE,
  125,
);
check("Gzipped `cubing/puzzles`", valueResults["puzzles"].size, 400);
check("`cubing/search` (uncompressed)", valueResults["search"].size, 1500);
check("Total (uncompressed)", valueResults["(total)"].size, 2000);
check("Total (gzipped)", valueResults["(total)"].gzippedSizeNoTHREE, 500);
