#!/usr/bin/env -S bun run --

import assert from "node:assert";
import { styleText } from "node:util";
import { Path } from "path-class";
import { PrintableShellCommand } from "printable-shell-command";

const PACKAGE_SCHEMA_FOLDER = new Path("./experimental-json-schema/kpuzzle/");

// TODO
type JSONSchema = any;

class SchemaInfo {
  // TODO: Return type for JSON schema?
  constructor(
    private typeName: string,
    private outputName: string = typeName,
  ) {}

  #cachedSchema: Promise<JSONSchema> | undefined;
  async schema(): Promise<JSONSchema> {
    // TODO: get this working with the JSON API.
    return (this.#cachedSchema ??= new PrintableShellCommand("bun", [
      [
        "x",
        "--",
        "bun-dx",
        "--package",
        "typescript-json-schema",
        "typescript-json-schema",
        "--",
      ],
      "--skipLibCheck",
      "--strictNullChecks",
      "--required",
      "src/cubing/kpuzzle/KPuzzleDefinitionJSON.ts",
      this.typeName,
    ])
      .print({ skipLineWrapBeforeFirstArg: true })
      .stdout()
      .json());
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
  new SchemaInfo("KPatternData"),
  new SchemaInfo("KPuzzleDefinitionJSON", "KPuzzleDefinition"),
  new SchemaInfo("KTransformationData"),
];

if (import.meta.main) {
  await Promise.all(schemas.map((schema) => schema.write()));
  await new PrintableShellCommand("bun", [
    ["x", "@biomejs/biome"],
    "check",
    "--write",
    PACKAGE_SCHEMA_FOLDER,
  ]).shellOut();
}
