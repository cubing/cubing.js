import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawnPromise } from "../../lib/execPromise";
import { packageNames } from "../common/package-info";

const UNBUNDLED_TYPES_ROOT = "./.temp/unbundled-types/src/cubing";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);
await spawnPromise("rm", ["-rf", "./.temp/unbundled-types"]);

await spawnPromise("npx", [
  "tsc",
  "--project",
  "./unbundled-types.tsconfig.json",
]);

for (const packageName of packageNames) {
  rename(
    `${UNBUNDLED_TYPES_ROOT}/${packageName}/index.d.ts`,
    `${UNBUNDLED_TYPES_ROOT}/${packageName}/index.ts`,
  );
}

await spawnPromise("npx", [
  "tsup",
  ...packageNames.map(
    (packageName) => `${UNBUNDLED_TYPES_ROOT}/${packageName}/index.ts`,
  ),
  "--dts-only",
  "--format",
  "esm",
  "--out-dir",
  "dist/lib/cubing",
]);

export const TYPESCRIPT_DECLARATION_INDEX = "index.d.ts";

// TODO: remove this once TypeScript resolves types from the `package.json` exports out of the box.
for (const packageName of packageNames) {
  await mkdir(packageName, { recursive: true });
  const indexFileName = join(packageName, TYPESCRIPT_DECLARATION_INDEX);
  await writeFile(
    indexFileName,
    `export * from ${JSON.stringify(
      join(
        "..",
        "dist",
        "lib",
        "cubing",
        packageName,
        TYPESCRIPT_DECLARATION_INDEX,
      ),
    )};
`,
    "utf-8",
  );
}
