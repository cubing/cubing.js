import { existsSync } from "node:fs";
import { rm, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { packageNames } from "../common/package-info";

export const TYPESCRIPT_DECLARATION_INDEX = "index.d.ts";

for (const packageName of packageNames) {
  const indexFileName = join(packageName, TYPESCRIPT_DECLARATION_INDEX);
  await rm(indexFileName, { force: true });
  if (existsSync(packageName)) {
    await rmdir(packageName);
  }
}
