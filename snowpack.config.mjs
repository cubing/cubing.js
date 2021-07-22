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

export const sitesSnowpackConfig = {
  mount: {
    "src/sites": { url: "/" },
  },
  ...common,
};

export const twizzleSnowpackConfig = {
  mount: {
    "src/sites/alpha.twizzle.net": {
      url: "/",
      dot: true, // for .htaccess
    },
  },
  buildOptions: {
    out: "dist/sites/alpha.twizzle.net",
    baseUrl: "/",
  },
  ...common,
  packageOptions: {
    knownEntrypoints: ["comlink"],
    external: ["crypto", "worker_threads", "@babylonjs/core"],
  },
};

export const experimentsSnowpackConfig = {
  mount: {
    "src/sites/experiments.cubing.net/cubing.js": {
      url: "/",
      dot: true, // for .htaccess
    },
  },
  buildOptions: {
    out: "dist/sites/experiments.cubing.net/cubing.js",
    baseUrl: "/cubing.js",
  },
  ...common,
};
