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
      "alg": "src/alg",
      "bluetooth": "src/bluetooth",
      "cubing": "src/cubing",
      "kpuzzle": "src/kpuzzle",
      "puzzle-geometry": "src/puzzle-geometry",
      "twisty": "src/twisty"
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
    input: "src/cubing",
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
