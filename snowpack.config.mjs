// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

// For some reason, Snowpack takes a long time to process Babylon. When measured
// once, `make build-experiments`, this made the difference between 32 seconds
// and 9 seconds.
const EXCLUDE_BABYLON = process.env["EXCLUDE_BABYLON"];
const babylonExternal = EXCLUDE_BABYLON ? ["@babylonjs/core"] : [];
if (EXCLUDE_BABYLON) {
  console.log("Excluding Babylon in Snowpack due to EXCLUDE_BABYLON env var!");
  console.log(
    "Hopefully this will make Snowpack dep installation significantly faster.",
  );
}

const common = {
  workspaceRoot: "/",
  mount: {
    "src/sites": { url: "/" },
  },
  exclude: ["**/.DS_Store"],
  packageOptions: {
    knownEntrypoints: ["comlink"],
    external: ["crypto", "worker_threads", ...babylonExternal],
  },
  devOptions: {
    port: 3333,
    hmr: true,
  },
  optimize: {
    bundle: true,
    splitting: true,
    minify: true,
    target: "es2020",
    sourcemap: false,
  },
};

export default {
  mount: {
    "src/sites": { url: "/" },
  },
  ...common,
};

export const twizzleSnowpackConfig = {
  mount: {
    "src/sites/twizzle": { url: "/" },
  },
  buildOptions: {
    out: "dist/sites/twizzle.net",
    baseUrl: "/",
  },
  ...common,
};

export const experimentsSnowpackConfig = {
  mount: {
    "src/sites/experiments.cubing.net/cubing.js": { url: "/" },
  },
  buildOptions: {
    out: "dist/sites/experiments.cubing.net/cubing.js",
    baseUrl: "/cubing.js",
  },
  ...common,
};
