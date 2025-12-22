import { build } from "esbuild";
import { packageVersion } from "../../../src/metadata/packageVersion";

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
  define: { "globalThis.PACKAGE_VERSION": JSON.stringify(packageVersion) },
  banner: {
    js: "#!/usr/bin/env node -S --",
  },
});

// Note: the output entry files are `chmod`ded by the `Makefile`.
