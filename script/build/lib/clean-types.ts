import { existsSync } from "node:fs";
import { rmdir } from "node:fs/promises";
import { Path } from "path-class";
import { packageNames } from "../common/package-info";

export const TYPESCRIPT_DECLARATION_INDEX = "index.d.ts";

for (const packageName of packageNames) {
  const indexFileName = new Path(packageName).join(
    TYPESCRIPT_DECLARATION_INDEX,
  );
  await indexFileName.rm({ force: true });
  if (existsSync(packageName)) {
    await rmdir(packageName);
  }
}
