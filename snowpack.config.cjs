// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    "src": "/"
  },
  exclude: [
    "src/dist-static/**/*"
  ],
  plugins: [
    "@snowpack/plugin-typescript"
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    port: 4444
  },
  buildOptions: {
    /* ... */
  },
};
