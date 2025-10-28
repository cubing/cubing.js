import { stat } from "node:fs/promises";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import { build } from "esbuild";
import { Path } from "path-class";
import { default as packageJSON } from "../../../../../../package.json" with {
  type: "json",
};
import { needPath } from "../../../../../lib/needPath.js";

const { exports: packageJSONExports } = packageJSON;

const rootFilePath = Path.resolve("../../../../../../", import.meta.url);

needPath(rootFilePath.join("dist/lib/cubing"), "make build-lib-js");

function subpackageEntry(subpackageName: string): Path {
  return Path.resolve(
    (packageJSONExports as unknown as any)[`./${subpackageName}`].import,
    rootFilePath,
  );
}

async function bundleSize(entryFile: Path, threeExternal = false) {
  const tempDir = await Path.makeTempDir("build-size-");
  const outfile = tempDir.join("bundle.js");
  await build({
    entryPoints: [entryFile.path],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2022",
    outfile: outfile.path,
    external: threeExternal ? ["three/src/*"] : [],
  });
  const { size } = await stat(outfile.path); // TODO: add `.state
  const bundleContents = await outfile.read();
  const gzippedSize = (await promisify(gzip)(bundleContents)).length;
  return { size, gzippedSize };
}

function humanSize(numBytes: number | string): string {
  return typeof numBytes === "number"
    ? `     ${Math.round(numBytes / 1000)}kB`.slice(-6)
    : numBytes;
}

interface Sizes {
  size: number;
  sizeNoTHREE: number | "";
  gzippedSize: number;
  gzippedSizeNoTHREE: number | "";
}

interface HumanReadableSizes {
  size: string;
  sizeNoTHREE: string | "";
  gzippedSize: string;
  gzippedSizeNoTHREE: string | "";
}

function mapValues(s: Sizes): HumanReadableSizes {
  // @ts-expect-error(ts2322): Limitation of Typescript
  return Object.fromEntries(
    Object.entries(s).map(([k, v]) => [k, humanSize(v)]),
  );
}

const CONSOLE_PATH = Path.resolve("./src/total.js", import.meta.url);

async function bundleSizeSummary(s: string): Promise<{
  name: string;
  sizes: Sizes;
  humanSizes: HumanReadableSizes;
}> {
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
  } satisfies Sizes;
  return {
    name: s,
    sizes,
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
  valueResults["twisty"].gzippedSizeNoTHREE as number,
  125,
);
check("Gzipped `cubing/puzzles`", valueResults["puzzles"].size, 400);
check("`cubing/search` (uncompressed)", valueResults["search"].size, 1500);
check("Total (uncompressed)", valueResults["(total)"].size, 2000);
check(
  "Total (gzipped)",
  valueResults["(total)"].gzippedSizeNoTHREE as number,
  500,
);
