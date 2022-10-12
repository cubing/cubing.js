import { join } from "path";
import { stdout } from "process";
import { execPromise } from "../../../../lib/execPromise.js";
import { needFolder } from "../../../../lib/need-folder.js";
import { packageNames } from "../../../../lib/packages.js";

const OUT_DIR = "./.temp/plain-esbuild-compat";

needFolder(
  new URL("../../../../../dist/esm", import.meta.url).pathname,
  "make build-esm",
);

const dist_entries = packageNames
  .map((e) => join("dist/esm/", e, "/index.js"))
  .join(" ");
console.log(
  `npx esbuild --bundle --splitting --outdir="${OUT_DIR}" --format=esm --minify ${dist_entries}`,
);
stdout.write(
  "Testing that the ESM build can be transpiled by `esbuild` with default compat settings...",
);
await execPromise(
  `npx esbuild --bundle --splitting --outdir="${OUT_DIR}" --format=esm --minify ${dist_entries}`,
);
console.log(" ✅ Success!");
