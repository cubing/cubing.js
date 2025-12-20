import { build } from "esbuild";

import { version as PACKAGE_VERSION } from "../../../package.json" with {
  type: "json",
};

await build({
  entryPoints: ["src/bin/*.ts"],
  outdir: "dist/bin/",
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2022",
  bundle: true,
  logLevel: "info",
  sourcemap: true,
  splitting: true,
  packages: "external",
  external: ["cubing/*"],
  supported: {
    "top-level-await": true,
  },
  define: { "globalThis.PACKAGE_VERSION": JSON.stringify(PACKAGE_VERSION) },
  banner: {
    js: "#!/usr/bin/env node",
  },
});

// Note: the output entry files are `chmod`ded by the `Makefile`.
