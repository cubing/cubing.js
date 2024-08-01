import { join } from "node:path";
import { stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { packageNames } from "../../../../../build/common/package-info.js";
import { execPromiseLogged } from "../../../../../lib/execPromise.js";
import { needPath } from "../../../../../lib/needPath.js";

// TODO: relative
const OUT_DIR = "./.temp/plain-esbuild-compat";

needPath(
  fileURLToPath(new URL("../../../../../../dist/lib/cubing", import.meta.url)),
  "make build-lib-js",
);

const dist_entries = packageNames
  .map((e) => join("dist/lib/cubing/", e, "/index.js"))
  .join(" ");
const cmd = `npx esbuild --bundle --splitting --outdir="${OUT_DIR}" --format=esm --minify ${dist_entries}`;
console.log(cmd);
stdout.write(
  "Testing that the ESM build can be transpiled by `esbuild` with default compat settings...",
);
await execPromiseLogged(
  `npx esbuild --bundle --splitting --outdir="${OUT_DIR}" --format=esm --minify ${dist_entries}`,
);
console.log(" ✅ Success!");
