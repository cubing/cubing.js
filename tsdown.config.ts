import { Path } from "path-class";
import { defineConfig } from "tsdown";
import { packageEntryPoints } from "./script/build/common/package-info";
import { packageNames } from "./script/build/common/packageNames";
import {
  DIST_LIB_CUBING,
  TYPESCRIPT_DECLARATION_INDEX,
} from "./script/build/common/paths";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);

// TODO: remove this once TypeScript resolves types from the `package.json` exports out of the box (by default).
for (const packageName of packageNames) {
  const path = new Path("./")
    .join(packageName)
    .join(TYPESCRIPT_DECLARATION_INDEX);
  console.info(`Writing legacy re-export to: ${path}`);
  await path.write(`export type * from ${JSON.stringify(
    new Path("../").join(
      DIST_LIB_CUBING,
      packageName,
      TYPESCRIPT_DECLARATION_INDEX,
    ).path,
  )};
`);
}
console.info("");

export default defineConfig({
  entry: packageEntryPoints,
  dts: { emitDtsOnly: true },
  format: "esm",
  outDir: "./dist/lib/cubing/",
  fixedExtension: false,
  clean: false, // We build into the same dir as `make build-js`.
});
