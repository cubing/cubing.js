import type { AllowedImports } from "@cubing/dev-config/check-allowed-imports";

/**
 * These definitions help to guard heavy code imports from light entry points.
 * It's okay to add entries, but be careful that this doesn't greatly increase
 * the dependency code of any important public API.
 */
export const mainAllowedImports: AllowedImports = {
  // script
  script: {
    static: [
      "node:assert",
      "node:http",
      "node:process",
      "node:util",

      "bun",

      "package.json",
      "cubing",
      "src/metadata",

      "@optique/core",
      "@optique/run",
      "barely-a-dev-server",
      "path-class",
      "printable-shell-command",

      "esbuild",
      "node-fetch",
      "playwright",
    ],
    dynamic: ["cubing"],
  },
  "script/bin": {
    static: ["src/cubing"],
  },
  "script/build/bin/build-bin.ts": {
    static: ["node:fs/promises"],
  },
  "script/lint/import-restrictions": {
    static: ["@cubing/dev-config"],
  },
  "script/test/dist/lib/cubing/build-size/main.ts": {
    static: ["node:util", "node:zlib"],
  },
  "script/cleanup": {
    static: ["node:fs", "node:fs/promises", "node:path"],
  },
  // src/bin
  "src/bin": {
    static: [
      "node:process",

      "@optique/core",
      "@optique/run",
      "path-class",
      "printable-shell-command",

      "cubing",
      "src/metadata",
    ],
    dynamic: ["node:process"],
  },
  // src/metadata
  "src/metadata": {
    static: ["@optique/core", "@optique/run", "path-class"],
  },
  // src/cubing
  "src/cubing/alg": {},
  "src/cubing/bluetooth": {
    static: [
      "src/cubing/alg",
      "src/cubing/kpuzzle",
      "src/cubing/protocol",
      "src/cubing/puzzles",
      "src/cubing/vendor/public-domain/unsafe-raw-aes",
      "three/src",
    ],
    dynamic: ["src/cubing/puzzles"],
  },
  "src/cubing/kpuzzle": { static: ["src/cubing/alg", "src/cubing/kpuzzle"] },
  "src/cubing/notation": {
    static: ["src/cubing/alg", "src/cubing/puzzles"],
  },
  "src/cubing/protocol": {
    static: ["src/cubing/kpuzzle", "src/cubing/puzzles/cubing-private"],
  },
  "src/cubing/puzzles": {
    static: [
      "src/cubing/alg",
      "src/cubing/kpuzzle",
      "src/cubing/vendor/mit/p-lazy",
    ],
    dynamic: ["src/cubing/puzzle-geometry"],
  },
  "src/cubing/puzzle-geometry": { static: ["src/cubing/alg"] },
  "src/cubing/scramble": {
    static: ["src/cubing/alg", "src/cubing/search/cubing-private"],
  },
  "src/cubing/search": {
    static: [
      "src/cubing/alg",
      "src/cubing/notation",
      "src/cubing/vendor/apache/comlink-everywhere",
    ],
  },
  "src/cubing/search/inside": {
    static: [
      "src/cubing/kpuzzle",
      "src/cubing/puzzles",
      "src/cubing/vendor/mit/cs0x7f/cstimer/src/js/scramble",
      "src/cubing/vendor/mit/cs0x7f/min2phase",
      "src/cubing/vendor/mit/cs0x7f/fto",
      "src/cubing/vendor/mit/cs0x7f/sq12phase",
      "src/cubing/vendor/mit/p-lazy",
      "src/cubing/vendor/mpl/xyzzy",
      "random-uint-below",
    ],
    dynamic: ["src/cubing/puzzle-geometry", "src/cubing/vendor/mpl/twips"],
  },
  "src/cubing/stream": {
    static: ["src/cubing/alg", "src/cubing/puzzles/cubing-private"], // TODO: why isn't this working?
  },
  "src/cubing/twisty": {
    static: [
      "src/cubing/alg",
      "src/cubing/puzzles",
      "src/cubing/notation",
      "src/cubing/vendor/mit/p-lazy",
      // TODO: denylist `src/cubing/twisty/heavy-code-imports`
    ],
    dynamic: [
      "src/cubing/alg",
      "src/cubing/bluetooth",
      "src/cubing/puzzle-geometry",
      "src/cubing/stream",
    ],
  },
  "src/cubing/twisty/heavy-code-imports": {
    static: ["three/src"],
  },
  "src/cubing/twisty/model/props/puzzle/display/SpriteProp.ts": {
    static: ["src/cubing/twisty/heavy-code-imports/3d"],
  },
  "src/cubing/twisty/views/2D": {
    static: ["src/cubing/twisty/heavy-code-imports/3d"],
  },
  "src/cubing/twisty/views/3D": {
    static: [
      "src/cubing/vendor/mit/three",
      "src/cubing/twisty/heavy-code-imports/3d",
    ],
  },
  "src/cubing/twisty/views/3D/puzzles": {
    static: [
      "three/src",
      "src/cubing/twisty/heavy-code-imports/3d",
      "src/cubing/vendor/mit/three",
    ],
  },
  "src/cubing/vendor": {
    static: ["src/cubing/alg", "random-uint-below"],
  },
  "src/cubing/vendor/apache/comlink-everywhere": {
    static: ["comlink"],
  },
  "src/cubing/vendor/mit/cs0x7f/cstimer/src/js/scramble/444-solver.ts": {
    static: ["src/cubing/search/cubing-private"],
  },
  // src/sites
  "src/sites": {
    static: ["src/cubing", "jszip", "three/src", "three/examples/jsm"],
  },
  "src/sites/experiments.cubing.net/cubing.js/rust/wasm": {},
  "src/sites/alpha.twizzle.net/explore": {
    static: ["src/cubing/puzzle-geometry/cubing-private"],
  },
};

// This is a separate definition because the `*.test.ts`/`*.test.dom.ts` files are interleaved with source files, and it's easier to run a separate check for them.
export const specAllowedImports: AllowedImports = {
  "src/cubing": {
    static: [
      "bun:test",
      "src/test/chai-workarounds",
      "src/test/SKIP_SLOW_TESTS.ts",

      "comlink",
      "three/src",
      "random-uint-below",
    ],
  },
  "src/test/chai-workarounds": {
    static: ["src/cubing/alg"],
    dynamic: ["@esm-bundle/chai"],
  },
  "src/test/SKIP_SLOW_TESTS.ts": {
    static: ["node:process"],
  },
};
