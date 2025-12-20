import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { packageNames } from "../common/packageNames";
import {
  DIST_LIB_CUBING,
  SRC_CUBING,
  TYPESCRIPT_DECLARATION_INDEX,
  TYPESCRIPT_INDEX,
} from "../common/paths";

console.warn(`
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
Note: The \`types\` target is slow. Expect several seconds.
⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳⏳
`);
await new PrintableShellCommand("bun", [
  ["x", "tsup"],
  ...packageNames.map(
    (packageName) => SRC_CUBING.join(packageName, TYPESCRIPT_INDEX).path,
  ),
  "--dts-only",
  ["--format", "esm"],
  ["--out-dir", DIST_LIB_CUBING.path],
]).shellOut();

// TODO: remove this once TypeScript resolves types from the `package.json` exports out of the box (by default).
for (const packageName of packageNames) {
  await new Path(packageName)
    .join(TYPESCRIPT_DECLARATION_INDEX)
    .write(`export * from ${JSON.stringify(
      new Path("../").join(
        DIST_LIB_CUBING,
        packageName,
        TYPESCRIPT_DECLARATION_INDEX,
      ).path,
    )};
`);
}
