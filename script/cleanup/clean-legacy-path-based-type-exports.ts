// NOTE: this file must be usable after `make reset`, so it cannot import any
// packages. (Built-in modules and intra-repo imports are fine, as long as they
// don't transitively import any packages.)

import { existsSync } from "node:fs";
import { rm, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { packageNames } from "../build/common/packageNames";

export const TYPESCRIPT_DECLARATION_INDEX_STRING = "index.d.ts";

for (const packageName of packageNames) {
  const indexFileName = join(packageName, TYPESCRIPT_DECLARATION_INDEX_STRING);
  await rm(indexFileName, { force: true });
  if (existsSync(packageName)) {
    await rmdir(packageName);
  }
}
