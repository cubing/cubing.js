// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

export default {
  workspaceRoot: "/",
  mount: {
    "src/experiments/static": { url: "/", static: true },
    "src/experiments/code": { url: "/_code" },
  },
  exclude: ["**/node.*", "**/get-random-values.*"],
  alias: {
    crypto: "./src/cubing/solve/snowpack-stubs.ts",
    worker_threads: "./src/cubing/solve/snowpack-stubs.ts",
  },
  installOptions: {
    externalPackage: ["crypto", "worker_threads"],
  },
  packageOptions: {
    knownEntrypoints: ["comlink"],
  },
  devOptions: {
    port: 3333,
  },
  buildOptions: {
    out: "dist/experiments",
    baseUrl: "/cubing.js",
  },
  optimize: {
    bundle: true,
    splitting: true,
    minify: true,
    target: "es2020",
    sourcemap: false,
  },
};
