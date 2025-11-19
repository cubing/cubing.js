import { join } from "node:path";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { packageNames } from "../common/package-info";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);
export const SRC_CUBING = "./src/cubing";
export const TYPESCRIPT_INDEX = "index.ts";
export const TYPESCRIPT_DECLARATION_INDEX = "index.d.ts";

await new PrintableShellCommand("bun", [
  ["x", "tsup"],
  ...packageNames.map((packageName) =>
    join(SRC_CUBING, packageName, TYPESCRIPT_INDEX),
  ),
  "--dts-only",
  ["--format", "esm"],
  ["--out-dir", "dist/lib/cubing"],
]).shellOut();

// TODO: remove this once TypeScript resolves types from the `package.json` exports out of the box (by default).
for (const packageName of packageNames) {
  await new Path(packageName)
    .join(TYPESCRIPT_DECLARATION_INDEX)
    .write(`export * from ${JSON.stringify(
      join(
        "..",
        "dist",
        "lib",
        "cubing",
        packageName,
        TYPESCRIPT_DECLARATION_INDEX,
      ),
    )};
`);
}
