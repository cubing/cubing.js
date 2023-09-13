import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import {
  libExternal,
  packageEntryPointsWithSearchWorkerEntry,
} from "../common/package-info.js";

export const esmOptions = {
  // TODO: construct entry points based on `exports` and add tests.
  entryPoints: packageEntryPointsWithSearchWorkerEntry,
  outdir: "dist/lib/cubing",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2020",
  bundle: true,
  splitting: true,
  logLevel: "info",
  sourcemap: true,
  //
  external: libExternal,
  metafile: true,
};

const result = await build(esmOptions);

await mkdir("./.temp", { recursive: true });
await writeFile(
  "./.temp/esbuild-metafile.json",
  JSON.stringify(result.metafile),
);
