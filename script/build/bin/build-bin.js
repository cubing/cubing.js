import { build } from "esbuild";
import { searchWorkerEsbuildWorkaroundEntry } from "../common/package-info.js";

await build({
  entryPoints: [
    "src/bin/order.ts",
    "src/bin/puzzle-geometry-bin.ts",
    "src/bin/import-restrictions-mermaid-diagram.ts",
    "src/bin/scramble.ts",
    searchWorkerEsbuildWorkaroundEntry,
  ],
  outdir: "dist/bin/",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2020",
  bundle: true,
  logLevel: "info",
  sourcemap: false, // TODO: allow when not publishing to `npm` (where it would just be bloat)
  splitting: true, // We need this so that `search-worker-entry.js` exists in the output and can be used by other binaries without importing duplicate copies of some code.
  packages: "external",
  supported: {
    "top-level-await": true,
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});

// Note: the output entry files are `chmod`ded by the `Makefile`.
