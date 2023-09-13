import { join } from "path";
import { stdout } from "process";
import { execPromiseLogged } from "../../../../../lib/execPromise.js";
import { needFolder } from "../../../../../lib/need-folder.js";
import { packageNames } from "../../../../../lib/packages.js";

// TODO: relative
const OUT_DIR = "./.temp/plain-esbuild-compat";

needFolder(
  new URL("../../../../../../dist/lib/cubing", import.meta.url).pathname,
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
