/*

Some notes:

- Don't allow the same cross-target import to be both direct and dynamic. If there is any direct import, we pay the same performance penalty regardless of any dynamic imports.
- TODO: remove all cyclic imports.

*/
export const targetInfos = {
  "alg": {
    deps: {
      direct: [],
      dynamic: []
    }
  },
  "bluetooth": {
    deps: {
      direct: ["alg", "kpuzzle", "puzzles"],
      dynamic: []
    }
  },
  "kpuzzle": {
    deps: {
      direct: ["alg", "protocol", "puzzles"],
      dynamic: []
    }
  },
  "notation": {
    deps: {
      direct: ["alg"],
      dynamic: []
    }
  },
  "protocol": {
    deps: {
      direct: ["alg", "kpuzzle", "puzzles"],
      dynamic: []
    }
  },
  "puzzle-geometry": {
    deps: {
      direct: ["alg"],
      dynamic: []
    }
  },
  "puzzles": {
    deps: {
      direct: ["alg", "kpuzzle"],
      dynamic: ["puzzle-geometry"]
    }
  },
  "stream": {
    deps: {
      direct: [],
      dynamic: []
    }
  },
  "twisty": {
    deps: {
      direct: ["alg", "kpuzzle", "notation", "puzzles"],
      dynamic: []
    }
  },
};


export const targetNames = Object.keys(targetInfos);
