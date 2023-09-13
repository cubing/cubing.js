export const allowedImports = {
  "src/cubing/alg": {},
  "src/cubing/kpuzzle": { static: ["src/cubing/kpuzzle"] },
  "src/cubing/puzzle-geometry": { dynamic: "src/cubing/twisty" },
  "src/cubing/twisty": {
    static: ["src/cubing/alg", "src/cubing/puzzles", "src/cubing/notation"],
    dynamic: ["src/cubing/alg", "src/cubing/puzzle-geometry"],
  },
};
