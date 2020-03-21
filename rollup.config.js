import resolve from "rollup-plugin-node-resolve";
import notify from "rollup-plugin-notify";
import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";
import tslint from "rollup-plugin-tslint";
import typescript2 from "rollup-plugin-typescript2";
import * as typescript from "typescript";
import json from "@rollup/plugin-json";
import { string } from "rollup-plugin-string";

const plugins = [
  pegjs(),
  tslint({
    exclude: [
      "node_modules/**",
      "src/**/parser/parser.js",
      "src/**/parser/parser.pegjs",
      "src/kpuzzle/definitions/*.json",
      "src/kpuzzle/definitions/svg/index.json",
      "src/kpuzzle/definitions/svg/*.svg",
    ],
  }),
  typescript2({
    typescript: typescript,
  }),
  notify({
    success: true,
  }),
  json(),
  string({
    include: "src/kpuzzle/definitions/svg/*.svg",
  }),
];

if (!process.env.ROLLUP_WATCH) {
  plugins.push(terser({
    keep_classnames: true,
  }));
}

const cjs = {
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

const esm = {
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
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    ...plugins,
  ],
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

const umdNoTwisty = {
  input: "src/cubing/no-twisty.ts",
  output: [
    {
      file: "dist/umd/cubing.no-twisty.umd.js",
      format: "umd",
      name: "cubing",
      sourcemap: true,
    },
  ],
  plugins: plugins,
};

const puzzleGeometryBin = {
  input: "src/puzzle-geometry/bin/puzzle-geometry-bin.ts",
  output: [
    {
      file: "dist/bin/puzzle-geometry-bin.js",
      format: "cjs",
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

const configs = [cjs, esm, umd, puzzleGeometryBin];

if (!process.env.ROLLUP_WATCH) {
  configs.push(umdNoTwisty);
}

export default configs;
