import { Path } from "path-class";

export const packageVersion: string =
  // biome-ignore lint/suspicious/noTsIgnore: This comment is stil present in the compiled file, where it is *not* expected.
  /** @ts-ignore Populated by `esbuild` at compile time. */
  globalThis.PACKAGE_VERSION ??
  // We don't want `package.json` in the import graph, so we don't use dynamic import here.
  (await Path.resolve("../../../package.json", import.meta.url).readJSON())
    .version;
