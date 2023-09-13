// Note:
// - Only the allowed imports for the most specific (longest) scope key applies to a source file.
// - Files in a given scope key are allowed to import any other within the same scope.
export const allowedImports = {
  "src/cubing/alg": {},
  "src/cubing/bluetooth": {
    static: [
      "src/cubing/alg",
      "src/cubing/kpuzzle",
      "src/cubing/protocol",
      "src/cubing/puzzles",
      "src/cubing/vendor/public-domain/unsafe-raw-aes",
      "node_modules/three",
    ],
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
      // "src/cubing/vendor/apache/comlink-everywhere",
      "src/cubing/vendor/gpl/cs0x7f/cstimer/src/js/scramble",
      "src/cubing/vendor/gpl/cs0x7f/min2phase",
      "src/cubing/vendor/gpl/cs0x7f/sq12phase",
      "src/cubing/vendor/mit/p-lazy",
      "src/cubing/vendor/mpl/xyzzy",
      "node_modules/random-uint-below",
    ],
    dynamic: ["src/cubing/puzzle-geometry", "src/cubing/vendor/mpl/twsearch"],
  },
  "src/cubing/stream": {
    static: ["src/cubing/alg"], // TODO: why isn't this working?
  },
  "src/cubing/twisty": {
    static: [
      "src/cubing/alg",
      "src/cubing/puzzles",
      "src/cubing/notation",
      "src/cubing/vendor/mit/p-lazy",
      // TODO: denylist `src/cubing/twisty/heavy-code-imports`
    ],
    dynamic: ["src/cubing/alg", "src/cubing/puzzle-geometry"],
  },
  "src/cubing/twisty/heavy-code-imports": {
    static: ["node_modules/three"],
  },
  "src/cubing/twisty/views/3D": {
    static: ["node_modules/three", "src/cubing/vendor/mit/three"],
  },
  "src/cubing/vendor": {
    static: ["src/cubing/alg", "node_modules/random-uint-below"],
  },
  "src/cubing/vendor/apache/comlink-everywhere": {
    static: [
      "node_modules/comlink",
      "node_modules/random-uint-below", // TODO: inherit?
    ],
  },
  "src/cubing/vendor/gpl/cs0x7f/cstimer/src/js/scramble/444-solver.ts": {
    static: ["src/cubing/search/cubing-private"],
  },
};
