import {terser} from "rollup-plugin-terser";
import * as typescript from "typescript"
import resolve from "rollup-plugin-node-resolve";
import typescript2 from "rollup-plugin-typescript2"
import tslint from "rollup-plugin-tslint";

const plugins = [
  tslint({}),
  typescript2({
    typescript: typescript,
  })
]

if (!process.env.ROLLUP_WATCH) {
  plugins.push(terser())
}

export default [
  {
    input: {
      "alg": "src/alg/index.ts",
      "bluetooth": "src/bluetooth/index.ts",
      "cubing": "src/cubing/index.ts",
      "kpuzzle": "src/kpuzzle/index.ts",
      "puzzle-geometry": "src/puzzle-geometry/index.ts",
      "twisty": "src/twisty/index.ts"
    },
    output: [
      {
        dir: "dist/esm",
        format: "esm",
        sourcemap: true
      }
    ],
    external: ["three"],
    plugins
  },
  {
    input: "src/cubing/index.ts",
    output: [
      {
        file: "dist/umd/cubing.umd.js",
        format: "umd",
        name: "cubing"
      }
    ],
    plugins: [
      ...plugins,
      resolve({
        only: ["three"]
      })
    ]
  }
]
