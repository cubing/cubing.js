// src/cubing/puzzles/implementations/2x2x2/2x2x2.kpuzzle.json
var name = "2x2x2";
var orbits = {
  CORNERS: {numPieces: 8, orientations: 3}
};
var startPieces = {
  CORNERS: {
    permutation: [0, 1, 2, 3, 4, 5, 6, 7],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0]
  }
};
var moves = {
  U: {
    CORNERS: {
      permutation: [1, 2, 3, 0, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  y: {
    CORNERS: {
      permutation: [1, 2, 3, 0, 7, 4, 5, 6],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  x: {
    CORNERS: {
      permutation: [4, 0, 3, 5, 7, 6, 2, 1],
      orientation: [2, 1, 2, 1, 1, 2, 1, 2]
    }
  },
  L: {
    CORNERS: {
      permutation: [0, 1, 6, 2, 4, 3, 5, 7],
      orientation: [0, 0, 2, 1, 0, 2, 1, 0]
    }
  },
  F: {
    CORNERS: {
      permutation: [3, 1, 2, 5, 0, 4, 6, 7],
      orientation: [1, 0, 0, 2, 2, 1, 0, 0]
    }
  },
  R: {
    CORNERS: {
      permutation: [4, 0, 2, 3, 7, 5, 6, 1],
      orientation: [2, 1, 0, 0, 1, 0, 0, 2]
    }
  },
  B: {
    CORNERS: {
      permutation: [0, 7, 1, 3, 4, 5, 2, 6],
      orientation: [0, 2, 1, 0, 0, 0, 2, 1]
    }
  },
  D: {
    CORNERS: {
      permutation: [0, 1, 2, 3, 5, 6, 7, 4],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  z: {
    CORNERS: {
      permutation: [3, 2, 6, 5, 0, 4, 7, 1],
      orientation: [1, 2, 1, 2, 2, 1, 2, 1]
    }
  }
};
var x2x2_kpuzzle_default = {
  name,
  orbits,
  startPieces,
  moves
};
export {
  x2x2_kpuzzle_default as default,
  moves,
  name,
  orbits,
  startPieces
};
