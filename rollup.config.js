import {terser} from "rollup-plugin-terser";
import * as typescript from "typescript";
import pegjs from "rollup-plugin-pegjs";
import resolve from "rollup-plugin-node-resolve";
import typescript2 from "rollup-plugin-typescript2";
import tslint from "rollup-plugin-tslint";
import notify from "rollup-plugin-notify";

const plugins = [
  pegjs(),
  tslint({
    exclude: [
      "node_modules/**",
      "src/**/parser/parser.js",
      "src/**/parser/parser.pegjs",
    ],
  }),
  typescript2({
    typescript: typescript,
  }),
  notify({
    success: true,
  }),
];

if (!process.env.ROLLUP_WATCH) {
  plugins.push(terser({
    keep_classnames: true,
  }));
}

const mod = {
  external: ["three"],
  input: {
    "alg": "src/alg/index.ts",
    "bluetooth": "src/bluetooth/index.ts",
    "cubing": "src/cubing/index.ts",
    "kpuzzle": "src/kpuzzle/index.ts",
    "puzzle-geometry": "src/puzzle-geometry/index.ts",
    "twisty": "src/twisty/index.ts",
  },
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins,
};

const umd = {
  input: "src/cubing/index.ts",
  output: [
    {
      file: "dist/umd/cubing.umd.js",
      format: "umd",
      name: "cubing",
      sourcemap: true,
    },
  ],
  plugins: [
    ...plugins,
    resolve({
      only: ["three"],
    }),
  ],
};

const configs = [umd];
if (!process.env.ROLLUP_WATCH) {
  configs.push(mod);
}

export default configs;
