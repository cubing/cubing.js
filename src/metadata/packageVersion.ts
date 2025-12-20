import type { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import { Path } from "path-class";

export const packageVersion: string =
  // biome-ignore lint/suspicious/noTsIgnore: This comment is stil present in the compiled file, where an error is *not* expected.
  /** @ts-ignore Populated by `esbuild` at compile time. */
  globalThis.PACKAGE_VERSION ??
  // We don't want `package.json` in the import graph (because this will trip up `esbuild` by default), so we load JSON instead using a dynamic import here.
  // This entire fallback expression should get compiled out by `esbuild`.
  (
    (await Path.resolve(
      "../../package.json",
      import.meta.url,
    ).readJSON()) as JSONSchemaForNPMPackageJsonFiles
  ).version;
