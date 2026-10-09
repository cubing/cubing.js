import { defineConfig } from "tsdown";
import { packageEntryPoints } from "./script/build/common/package-info.ts";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);

export default defineConfig({
  entry: packageEntryPoints,
  dts: { emitDtsOnly: true },
  format: "esm",
  outDir: "./dist/lib/cubing/",
  fixedExtension: false,
  clean: false, // We build into the same dir as `make build-js`.
});
