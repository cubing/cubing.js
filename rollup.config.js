import {terser} from "rollup-plugin-terser";
import * as typescript from "typescript"
import pegjs from "rollup-plugin-pegjs";
import resolve from "rollup-plugin-node-resolve";
import typescript2 from "rollup-plugin-typescript2"
import tslint from "rollup-plugin-tslint";

const plugins = [
  pegjs(),
  tslint({
    exclude: ["node_modules/**", "src/alg/parser-source.js", "src/alg/parser-source.pegjs"]
  }),
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
    external: ["three", "parser-source.pegjs"],
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
        only: ["three", "parser-source.pegjs"]
      })
    ]
  }
]
