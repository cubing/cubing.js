// Snowpack Configuration File
// See all supported options: https://www.snowpack. dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: "/",
  mount: {
    "src/snowpack/static": { url: "/", static: true },
    "src/snowpack/code": { url: "/code" },
  },
  packageOptions: {
    external: ["child_process"],
  },
  devOptions: {
    port: 4444,
  },
  buildOptions: {
    out: "dist/snowpack",
  },
};
