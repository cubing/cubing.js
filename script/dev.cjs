const {
  loadConfiguration,
  startServer,
  createConfiguration,
} = require("snowpack");
const { build } = require("esbuild");

const config = createConfiguration({
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
});

(async () => {
  console.log("starting?");
  const esbuildServerPromise = build({
    entryPoints: ["src/cubing/twisty/worker/inside/src/worker-inside.ts"],
    outfile: "src/cubing/twisty/worker/inside/generated/worker-inside.js",
    format: "cjs",
    target: "es2015",
    bundle: true,
    watch: true,
    logLevel: "info",
  });
  esbuildServerPromise.catch(() => process.exit(1));

  await esbuildServerPromise;

  setTimeout(async () => {
    const snowpackServerPromise = startServer({ config }, { isDev: true });
    await Promise.all([esbuildServerPromise, snowpackServerPromise]);
  }, 1000);
})();
