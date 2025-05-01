import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrintableShellCommand } from "printable-shell-command";
import { packageNames } from "../../../../../build/common/package-info.js";
import { needPath } from "../../../../../lib/needPath.js";

// TODO: relative
const OUT_DIR = "./.temp/plain-esbuild-compat";

needPath(
  fileURLToPath(new URL("../../../../../../dist/lib/cubing", import.meta.url)),
  "make build-lib-js",
);

const dist_entries = packageNames.map((e) =>
  join("dist/lib/cubing/", e, "/index.js"),
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
]).shellOutBun();
console.log(" ✅ Success!");
