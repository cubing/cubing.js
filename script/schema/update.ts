#!/usr/bin/env -S bun run --

import assert from "node:assert";
import { styleText } from "node:util";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";
import { toJSONSchema, type ZodMiniObject, type ZodMiniRecord } from "zod/mini";
import {
  ZodKPatternData,
  ZodKPuzzleDefinitionJSON,
  ZodKTransformationData,
} from "./zodSchemas";

const PACKAGE_SCHEMA_FOLDER = new Path("./experimental-json-schema/kpuzzle/");

class SchemaInfo {
  // TODO: Return type for JSON schema?
  constructor(
    private zodSchema: ZodMiniRecord<any> | ZodMiniObject<any>,
    private outputName: string,
  ) {}

  async schema(): Promise<any> {
    // TODO: get this working with the JSON API.
    return toJSONSchema(this.zodSchema);
  }

  get outputPath(): Path {
    return PACKAGE_SCHEMA_FOLDER.join(`${this.outputName}.schema.json`);
  }

  // TODO: share definitions across schemas.
  async write(): Promise<void> {
    await this.outputPath.writeJSON(await this.schema());
    console.log(
      `Wrote ${styleText(["underline", "blue"], this.outputPath.path)}`,
    );
  }

  async check(): Promise<void> {
    assert.deepEqual(await this.outputPath.readJSON(), await this.schema());
  }
}

export const schemas = [
  new SchemaInfo(ZodKPatternData, "KPatternData"),
  new SchemaInfo(ZodKPuzzleDefinitionJSON, "KPuzzleDefinition"),
  new SchemaInfo(ZodKTransformationData, "KTransformationData"),
];

if (import.meta.main) {
  await Promise.all(schemas.map((schema) => schema.write()));
  await new PrintableShellCommand("bun", [
    ["x", "--", "bun-dx", "--package", "@biomejs/biome", "biome", "--"],
    ["check", "--write", "--"],
    ...schemas.map((schema) => schema.outputPath),
  ]).shellOut();
}
