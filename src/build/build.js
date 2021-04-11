import {build} from "esbuild";
import { resolve } from "path";
import { existsSync } from "fs";

// Note that we have to use an extra `..` to back out of the file name
const PATH_TO_SRC_CUBING = resolve(new URL(".", import.meta.url).pathname, "../cubing");

class Target {
  constructor(name) {
    this.name = name;
    this.outdir = `./${this.name}`

    this.dirPath = resolve(PATH_TO_SRC_CUBING, this.name);
    if (!existsSync(this.dirPath)) {
      throw new Error(`Folder doesn't exist: ${this.name}`)
    }

    this.indexFilePath = resolve(this.dirPath, "index.ts")
    if (!existsSync(this.indexFilePath)) {
      throw new Error(`Entry point index file doesn't exist: ${this.name}`)
    }

    this.regExp = new RegExp(this.name);
  }

  plugin(forTarget) {
    const setup = (build) => {
      if (this.name === forTarget.name) {
        return undefined
      }
      build.onResolve({ filter: this.regExp }, (args) => {
        if (args.kind !== "import-statement" && args.kind !== "dynamic-import") { // TODO
          return undefined
        }

        const resolved = resolve(args.resolveDir, args.path);
        if(this.dirPath === resolved) {
          return {
            path: `cubing/${this.name}`,
            external: true
          }
        }

        if (resolved.startsWith(forTarget.dirPath + "/")) {
          return undefined
        }

        console.error("Bad import! Imports between targets must reference each other's top-level folders.")
        console.log("Path: ", args.path)
        console.log("From: ", args.importer)
        process.exit(1)
      })
    }
    return {
      name: this.name,
      setup: setup
    }
  }
}

const targets = []
for (const name of [
  "alg",
  "bluetooth",
  "kpuzzle",
  "notation",
  "protocol",
  "puzzle-geometry",
  "puzzles",
  "stream",
  "twisty"
]) {
  targets.push(new Target(name))
}

// targets.map(a => console.log(a.dirPath))

for (const currentTarget of targets) {
  build({
    target: "es2020",
    bundle: true,
    splitting: true,
    format: "esm",
    // sourcemap: true,
    outdir: currentTarget.outdir,
    external: [
      "three"
    ],
    entryPoints: [
      currentTarget.indexFilePath
    ],
    plugins: targets.map(t => t.plugin(currentTarget)),
  })
}
