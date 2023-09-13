import { spawnPromise } from "../../lib/execPromise.js";
import { packageEntryPoints } from "../common/package-info.js";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);
await spawnPromise("npx", [
  "tsup",
  ...packageEntryPoints,
  "--dts-only",
  "--out-dir",
  "dist/lib/cubing",
]);
