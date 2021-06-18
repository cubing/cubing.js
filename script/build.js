import * as snowpack from "snowpack";
import * as esbuild from "esbuild";

import configSrc from "../snowpack.config.mjs";

export async function build(target, dev) {
  const depPromises = target.dependencies.map((dependency) =>
    build(dependency, dev),
  );
  await depPromises;
  return Promise.all(depPromises.concat([target.buildSelf(dev)]));
}

export const SolveWorkerBuild = {
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

export const SnowpackBuild = {
  dependencies: [],
  buildSelf: async (dev) => {
    const config = snowpack.createConfiguration(configSrc);

    if (!workerOnly) {
      const snowpackPromise = dev
        ? snowpack.startServer({ config }, { isDev: dev })
        : snowpack.build({ config });
      await snowpackPromise;
    }
  },
};

const target = process.argv[2];
if (!target) {
  console.error("not a target:", target);
  process.exit(1);
}

const dev = process.argv[3] === "dev";

const targets /*: Record<String, SolverWorker>*/ = {
  "solve-worker": SolveWorkerBuild,
};

(async () => {
  // console.log(targets[target]);
  await build(targets[target], dev);
})();
