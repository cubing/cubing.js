/*

Some notes:

- Don't allow the same cross-target import to be both direct and dynamic. If there is any direct import, we pay the same performance penalty regardless of any dynamic imports.
  - Exception: If you're actively trying to convert all those direct imports to dynamic, it may make sense to commit intermediate progress with both allowed.
- TODO: remove all cyclic imports.

*/
export const targetInfos = {
  "alg": {
    deps: {
      direct: [],
      dynamic: [],
    },
  },
  "bluetooth": {
    deps: {
      direct: ["alg", "kpuzzle", "protocol", "puzzles"],
      dynamic: [],
    },
  },
  "kpuzzle": {
    deps: {
      direct: ["alg", "protocol", "puzzles"],
      dynamic: [],
    },
  },
  "notation": {
    deps: {
      direct: ["alg"],
      dynamic: [],
    },
  },
  "protocol": {
    deps: {
      direct: ["alg", "kpuzzle", "puzzles"],
      dynamic: [],
    },
  },
  "puzzle-geometry": {
    deps: {
      direct: ["alg"],
      dynamic: [],
    },
  },
  "puzzles": {
    deps: {
      direct: ["alg", "kpuzzle"],
      dynamic: ["puzzle-geometry"],
    },
  },
  "scramble": {
    deps: {
      direct: ["alg", "solve"],
      dynamic: [],
    },
  },
  "solve": {
    deps: {
      direct: ["alg", "kpuzzle", "puzzles"],
      dynamic: [],
    },
  },
  "stream": {
    deps: {
      direct: ["alg"],
      dynamic: [],
    },
  },
  "twisty": {
    deps: {
      direct: ["alg", "kpuzzle", "notation", "puzzles"],
      dynamic: [],
    },
  },
};

export const targetNames = Object.keys(targetInfos);
