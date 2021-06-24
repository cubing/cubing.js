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
    crypto: "./src/experiments/code/stub/index.ts",
    worker_threads: "./src/experiments/code/stub/index.ts",
  },
  installOptions: {
    externalPackage: ["crypto", "worker_threads"],
  },
  packageOptions: {
    knownEntrypoints: [
      "comlink-everywhere/static-node-imports/outside",
      "comlink-everywhere/static-node-imports/inside",
      "comlink",
    ],
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
