export type AllowedImports = Record<
  string,
  { static?: string[]; dynamic?: string[] }
>;

/**
 * These definitions help to guard heavy code imports from light entry points.
 * It's okay to add entries, but be careful that this doesn't greatly increase
 * the dependency code of any important public API.
 *
 * Note:
 * - Only the allowed imports for the most specific (longest) scope key applies to a source file.
 * - Files in a given scope key are allowed to import any other within the same scope.
 */
export const mainAllowedImports: AllowedImports = {
  // script
  script: {
    static: [
      "node:assert",
      "node:child_process",
      "node:fetch",
      "node:fs", // TODO: `existsSync(…)`
      "node:fs/promises",
      "node:http",
      "node:path",
      "node:process",
      "node:util",
      "node:url",
      "node:zlib",

      "package.json",
      "cubing",

      "barely-a-dev-server",
      "esbuild",
      "node-fetch",
      "playwright",
      "cmd-ts-too",
    ],
    dynamic: ["cubing", "node:repl"],
  },
  // src/bin
  "src/bin": {
    static: ["cubing"],
    dynamic: ["cmd-ts-too"],
  },
  "src/bin/guards/cmd-ts-too-guard.ts": {
    static: ["node:process"],
    dynamic: ["cmd-ts-too"],
  },
  // src/lib
  "src/cubing/alg": {},
  "src/cubing/bluetooth": {
    static: [
      "src/cubing/alg",
      "src/cubing/kpuzzle",
      "src/cubing/protocol",
      "src/cubing/puzzles",
      "src/cubing/vendor/public-domain/unsafe-raw-aes",
      "three",
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
    dynamic: [
      "src/cubing/puzzle-geometry",
      "src/cubing/vendor/mpl/twsearch",
      "src/cubing/vendor/mpl/twsearch-cpp",
    ],
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
    static: ["three"],
  },
  "src/cubing/twisty/views/3D": {
    static: ["three", "src/cubing/vendor/mit/three"],
  },
  "src/cubing/vendor": {
    static: [
      "src/cubing/alg",
      "random-uint-below",
      "getbuiltinmodule-ponyfill",
    ],
  },
  "src/cubing/vendor/apache/comlink-everywhere": {
    static: ["comlink", "getbuiltinmodule-ponyfill"],
  },
  "src/cubing/vendor/mit/cs0x7f/cstimer/src/js/scramble/444-solver.ts": {
    static: ["src/cubing/search/cubing-private"],
  },
  // src/sites
  "src/sites": {
    static: ["src/cubing", "jszip", "three"],
  },
  "src/sites/experiments.cubing.net/cubing.js/rust/wasm": {
    static: ["getbuiltinmodule-ponyfill"],
  },
  "src/sites/alpha.twizzle.net/explore": {
    static: ["src/cubing/puzzle-geometry/cubing-private"],
  },
};

// This is a separate definition because the `spec` files are interleaved with source files, and it's easier to run a separate check for them.
export const specAllowedImports: AllowedImports = {
  "src/cubing": {
    static: [
      "bun:test",
      "src/test/chai-workarounds",
      "src/test/SKIP_SLOW_TESTS.ts",

      "comlink",
      "three",
      "random-uint-below",
      "getbuiltinmodule-ponyfill",
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
