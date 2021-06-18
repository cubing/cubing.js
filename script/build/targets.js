import * as esbuild from "esbuild";

export async function build(target) {
  const depPromises = target.dependencies.map((dependency) =>
    build(dependency),
  );
  await depPromises;
  return Promise.all(depPromises.concat([target.buildSelf()]));
}

export const SolveWorker = {
  dependencies: [],
  buildSelf: (dev) => {
    return esbuild.build({
      entryPoints: ["src/cubing/solve/worker/worker-inside-src.ts"],
      outfile: "src/cubing/solve/worker/worker-inside-generated.cjs",
      format: "cjs",
      target: "es2015",
      bundle: true,
      watch: !!dev,
      logLevel: "info",
    });
  },
};
