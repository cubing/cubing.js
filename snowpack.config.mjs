// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

export default {
  workspaceRoot: "/",
  mount: {
    "src/experiments/static": { url: "/", static: true },
    "src/experiments/code": { url: "/_code" },
  },
  exclude: ["**/.DS_Store"],
  packageOptions: {
    knownEntrypoints: ["comlink"],
    external: ["crypto", "worker_threads"],
  },
  devOptions: {
    port: 3333,
    hmr: true,
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
