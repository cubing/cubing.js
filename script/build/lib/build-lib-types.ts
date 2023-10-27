import { spawnPromise } from "../../lib/execPromise";
import { packageEntryPoints } from "../common/package-info";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);
await spawnPromise("npx", [
  "tsup",
  ...packageEntryPoints,
  "--dts-only",
  "--format",
  "esm",
  "--out-dir",
  "dist/lib/cubing",
]);
