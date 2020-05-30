// We need to tell `eslint` to ignore TS errors, because it tries to apply TS linting to JS. 🤷‍♀️
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import resolve from "rollup-plugin-node-resolve";
import notify from "rollup-plugin-notify";
import pegjs from "rollup-plugin-pegjs";
import { terser } from "rollup-plugin-terser";
import typescript2 from "rollup-plugin-typescript2";
import * as typescript from "typescript";
import json from "@rollup/plugin-json";
import { string } from "rollup-plugin-string";
import { eslint } from "rollup-plugin-eslint";

// Due to our toolchain, `rollup` normally emits some warnings that don't
// actually indicate anything wrong with our code. We can suppress known
// warnings per target, although this would also suppress the warning if it
// appears for a new reason.
const SUPPRESS_KNOWN_WARNINGS = true;

const plugins = [
  pegjs(),
  eslint({
    exclude: ["**/*.json", "**/*.pegjs", "**/*.svg"],
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
  plugins.push(
    terser({
      // eslint-disable-next-line @typescript-eslint/camelcase
      keep_classnames: true,
    }),
  );
}

const submoduleInputs = {
  "alg": "src/alg/index.ts",
  "bluetooth": "src/bluetooth/index.ts",
  "cubing": "src/cubing/index.ts",
  "kpuzzle": "src/kpuzzle/index.ts",
  "puzzle-geometry": "src/puzzle-geometry/index.ts",
  "stream": "src/stream/index.ts",
  "twisty": "src/twisty/index.ts",
};

// From https://github.com/rollup/rollup/issues/794#issuecomment-260694288
// Format from: https://github.com/rollup/rollup/issues/408#issuecomment-446998462
function onwarn(ignoredErrorCodes) {
  return function (warning, warn) {
    if (
      SUPPRESS_KNOWN_WARNINGS &&
      ignoredErrorCodes.indexOf(warning.code) !== -1
    ) {
      return;
    }
    warn(warning);
  };
}

const cjs = {
  external: ["three"],
  input: submoduleInputs,
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins,
  onwarn: onwarn(["THIS_IS_UNDEFINED"]),
};

const esm = {
  external: ["three"],
  input: submoduleInputs,
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [...plugins],
  onwarn: onwarn(["THIS_IS_UNDEFINED"]),
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
  onwarn: onwarn(["THIS_IS_UNDEFINED"]),
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
  onwarn: onwarn(["UNRESOLVED_IMPORT", "MISSING_GLOBAL_NAME"]),
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
  onwarn: onwarn([]),
};

const configs = [cjs, esm, umd, puzzleGeometryBin];

if (!process.env.ROLLUP_WATCH) {
  configs.push(umdNoTwisty);
}

export default configs;
