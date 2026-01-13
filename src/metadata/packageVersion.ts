export const packageVersion: string =
  // biome-ignore lint/suspicious/noTsIgnore: This comment is stil present in the compiled file, where an error is *not* expected.
  /** @ts-ignore Populated by `esbuild` at compile time. */
  globalThis.PACKAGE_VERSION ??
  // We don't want to pull in the dynamic code into the import graph, so we use
  // dynamic import here. This entire fallback expression should get compiled
  // out by `esbuild`.
  (await import("./packageVersionDynamic")).version;
