import { type BuildResult, build, type PluginBuild } from "esbuild";
import { Path } from "path-class";
import { packageVersion } from "../../../src/metadata/packageVersion";

const OUT_DIR = new Path("./dist/bin/");

// We'd transfer the executable only when the source has it, but our binary source entries purposely don't have a shebang.
const makeEntriesExecutable = {
  name: "makeEntriesExecutable",
  async setup(build: PluginBuild) {
    build.initialOptions.metafile = true;

    const promises: Promise<Path>[] = [];
    build.onEnd(async (result: BuildResult) => {
      for (const [outputPath, output] of Object.entries(
        result.metafile!.outputs,
      )) {
        if (output.entryPoint) {
          promises.push(new Path(outputPath).chmodX());
        }
      }
      await Promise.all(promises);
    });
  },
};

await build({
  entryPoints: ["src/bin/*.ts"],
  outdir: OUT_DIR.path,
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2022",
  bundle: true,
  logLevel: "info",
  sourcemap: true,
  splitting: true,
  packages: "external",
  external: ["cubing/*"],
  supported: {
    "top-level-await": true,
  },
  define: { "globalThis.PACKAGE_VERSION": JSON.stringify(packageVersion) },
  banner: {
    js: "#!/usr/bin/env -S node --",
  },
  plugins: [makeEntriesExecutable],
});
