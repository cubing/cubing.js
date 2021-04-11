import {build} from "esbuild";
import { resolve } from "path";
import { existsSync } from "fs";

// Note that we have to use an extra `..` to back out of the file name
const PATH_TO_SRC_CUBING = resolve(new URL(".", import.meta.url).pathname, "../cubing");

class Target {
  constructor(name) {
    this.name = name;

    this.dirPath = resolve(PATH_TO_SRC_CUBING, this.name);
    if (!existsSync(this.dirPath)) {
      throw new Error(`Folder doesn't exist: ${this.name}`)
    }

    this.indexFilePath = resolve(this.dirPath, "index.ts")
    if (!existsSync(this.indexFilePath)) {
      throw new Error(`Entry point index file doesn't exist: ${this.name}`)
    }

    this.regExp = new RegExp(this.name);

    const setup = (build) => {
      console.log(this.name)
      for (const otherTarget of targets ) {
        if (otherTarget.name === this.name) {
          continue
        }
        build.onResolve({ filter: otherTarget.regExp }, (arg) => {
          const resolved = resolve(arg.resolveDir, arg.path);
          if(otherTarget.dirPath === resolved) {
            return {
              path: `cubing/${otherTarget.name}`,
              external: true
            }
          }

          if (resolved.startsWith(this.dirPath + "/")) {
            return arg
          }

          console.error("bad import!")
          console.log(this.indexFilePath)
          console.error(arg)
          process.exit(1)
        })
      }
    }
    this.plugin = {
      name: this.name,
      setup
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

const currentTarget = new Target("alg")
build({
  target: "es2015",
  bundle: true,
  splitting: true,
  format: "esm",
  sourcemap: true,
  outdir: "dist/esm",
  external: [
    "three"
  ],
  entryPoints: [
    currentTarget.indexFilePath
  ],
  plugins: targets.map(t => t.plugin),
})


// npx \
//   esbuild \
//   --target=es2015 \
//   --bundle \
//   --external:three \
//   --external:"./src/cubing/alg/*" \
//   --external:"src/cubing/alg/*" \
//   --external:"./cubing/alg/*" \
//   --external:"cubing/alg/*" \
//   --external:"./cubing/*" \
//   --external:"cubing/*" \
//   --external:"./alg/*" \
//   --external:"alg/*" \
//   --external:"../alg/*" \
//   --splitting \
//   --format=esm \
//   --sourcemap \
//   --outdir=dist/esm \
//   src/cubing/kpuzzle/index.ts
