import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { packageNames } from "../../../../../build/common/packageNames.js";
import {
  DIST_LIB_CUBING,
  JAVASCRIPT_INDEX,
} from "../../../../../build/common/paths.js";
import { needPath } from "../../../../../lib/needPath.js";

// TODO: relative
const OUT_DIR = "./.temp/plain-esbuild-compat";

await needPath(
  Path.resolve("../../../../../../dist/lib/cubing", import.meta.url),
  "make build-lib-js",
);

const dist_entries = packageNames.map(
  (p) => DIST_LIB_CUBING.join(p, JAVASCRIPT_INDEX).path,
);
console.log(
  "Testing that the ESM build can be transpiled by `esbuild` with default compat settings...",
);
await new PrintableShellCommand("npx", [
  "esbuild",
  "--bundle",
  "--splitting",
  `--outdir=${OUT_DIR}`,
  "--format=esm",
  "--minify",
  ...dist_entries,
]).shellOut();
console.log(" ✅ Success!");
