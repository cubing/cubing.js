import { mkdir, writeFile } from "node:fs/promises";
import { type BuildOptions, build } from "esbuild";
import { packageEntryPointsWithSearchWorkerEntry } from "../common/package-info";

// In theory we could set `packages: "external"` here and rely on `make
// test-src-import-restrictions`, but this is safer.
export const external = ["three/src/*", "comlink", "random-uint-below"];

export const esmOptions: BuildOptions = {
  // TODO: construct entry points based on `exports` and add tests.
  entryPoints: packageEntryPointsWithSearchWorkerEntry,
  outdir: "dist/lib/cubing",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2022",
  bundle: true,
  splitting: true,
  logLevel: "info",
  sourcemap: true,
  //
  external: external,
  metafile: true,
};

const result = await build(esmOptions);

await mkdir("./.temp", { recursive: true });
await writeFile(
  "./.temp/esbuild-metafile.json",
  JSON.stringify(result.metafile),
);
