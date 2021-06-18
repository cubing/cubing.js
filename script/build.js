import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import configSrc from "../snowpack.config.mjs";
import { execPromise } from "./execPromise.js";

export async function build(target, dev) {
  const depPromises = target.dependencies.map((dependency) =>
    build(dependency, dev),
  );
  await depPromises;
  return Promise.all(depPromises.concat([target.buildSelf(dev)]));
}

export const SolveWorkerTarget = {
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["src/cubing/solve/worker/worker-inside-src.ts"],
      outfile: "src/cubing/solve/worker/worker-inside-generated.cjs",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: dev,
      logLevel: "info",
    });
  },
};

export const BundleGlobalTarget = {
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["src/cubing/cubing.bundle-global.ts"],
      outfile: "dist/bundle-global/cubing.bundle-global.js",
      format: "cjs",
      target: "es2020",
      bundle: true,
      minify: true,
      watch: dev,
      logLevel: "info",
    });
  },
};

//npm run build-worker; npx esbuild --target=es2020 --bundle --external:three --external:web-worker --format=cjs --outfile=dist/cjs/index.js src/cubing/index.ts && cp -R src/dist-static/cjs/* dist/cjs
export const cjsTarget = {
  dependencies: [],
  buildSelf: async (dev) => {
    await esbuild.build({
      entryPoints: ["src/cubing/index.ts"],
      outfile: "dist/cjs/index.js",
      format: "cjs",
      target: "es2020",
      bundle: true,
      watch: dev,
      logLevel: "info",
      //
      external: ["three", "web-worker"],
    });
    await execPromise("cp -R src/dist-static/cjs/* dist/cjs");
  },
};

export const SnowpackTarget = {
  dependencies: [SolveWorkerTarget],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(configSrc);

    const snowpackPromise = dev
      ? snowpack.startServer({ config }, { isDev: dev })
      : snowpack.build({ config });
    await snowpackPromise;
  },
};

const target = process.argv[2];
if (!target) {
  console.error("not a target:", target);
  process.exit(1);
}

const dev = process.argv[3] === "dev";

const targets /*: Record<String, SolverWorker>*/ = {
  "solve-worker": SolveWorkerTarget,
  "snowpack": SnowpackTarget,
  "bundle-global": BundleGlobalTarget,
  "cjs": cjsTarget,
};

(async () => {
  // console.log(targets[target]);
  await build(targets[target], dev);
})();
