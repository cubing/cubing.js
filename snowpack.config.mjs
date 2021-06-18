// Snowpack Configuration File
// See all supported options: https://www.snowpack. dev/reference/configuration

export default {
  workspaceRoot: "/",
  mount: {
    "src/experiments/static": { url: "/", static: true },
    "src/experiments/code": { url: "/_code" },
  },
  packageOptions: {},
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
