// import pkg from "./package.json"
import {terser} from "rollup-plugin-terser";
import * as typescript from "typescript"
import typescript2 from "rollup-plugin-typescript2"
import tslint from "rollup-plugin-tslint";

export default {
  input: {
    "alg": "src/alg/index.ts",
    "bluetooth": "src/bluetooth/index.ts",
    "cubing": "src/cubing/index.ts",
    "kpuzzle": "src/kpuzzle/index.ts",
    "puzzle-geometry": "src/puzzle-geometry/index.ts",
    "twisty": "src/twisty/index.ts"
  },
  output: [
    // TODO: UMD build.
    {
      dir: "dist",
      format: "esm",
      name: "cubing",
      sourcemap: true,
      external: [ "three" ]
    }
  ],
  plugins: [
    tslint({}),
    typescript2({
      typescript: typescript,
    }),
    terser()
  ]
}
