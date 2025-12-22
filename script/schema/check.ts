#!/usr/bin/env -S bun run --

import { exit } from "node:process";
import { styleText } from "node:util";
import { schemas } from "./update";

let failed = false;
for (const [schema, schemaCheck] of schemas.map(
  (schema) => [schema, schema.check()] as const,
)) {
  try {
    await schemaCheck;
    console.log(
      `✅ ${styleText(["underline", "blue"], schema.outputPath.path)} is up to date.`,
    );
  } catch {
    console.log(
      `❌ ${styleText(["underline", "blue"], schema.outputPath.path)} is not up to date.`,
    );
    failed = true;
  }
}

if (failed) {
  console.log("Run `make update-schemas` to update them.");
  exit(1);
}
