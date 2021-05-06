// Snowpack Configuration File
// See all supported options: https://www.snowpack. dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: "/",
  mount: {
    "src/snowpack/static": { url: "/", static: true },
    "src/snowpack/code": { url: "/_code" },
  },
  packageOptions: {},
  devOptions: {
    port: 3333,
  },
  buildOptions: {
    out: "dist/snowpack",
    baseUrl: "/cubing.js",
  },
};
