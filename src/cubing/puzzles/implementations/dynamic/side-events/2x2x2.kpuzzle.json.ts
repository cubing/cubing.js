import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const cube2x2x2JSON: KPuzzleDefinition = {
  name: "2x2x2",
  orbits: {
    CORNERS: { numPieces: 8, numOrientations: 3 },
  },
  startStateData: {
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  moves: {
    U: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    y: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    x: {
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientation: [2, 1, 2, 1, 1, 2, 1, 2],
      },
    },
    L: {
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientation: [0, 0, 2, 1, 0, 2, 1, 0],
      },
    },
    F: {
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0],
      },
    },
    R: {
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientation: [2, 1, 0, 0, 1, 0, 0, 2],
      },
    },
    B: {
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientation: [0, 2, 1, 0, 0, 0, 2, 1],
      },
    },
    D: {
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    z: {
      CORNERS: {
        permutation: [3, 2, 6, 5, 0, 4, 7, 1],
        orientation: [1, 2, 1, 2, 2, 1, 2, 1],
      },
    },
  },
};

cube2x2x2JSON.moves["Rv"] = cube2x2x2JSON.moves["x"];
cube2x2x2JSON.moves["Uv"] = cube2x2x2JSON.moves["y"];
cube2x2x2JSON.moves["Fv"] = cube2x2x2JSON.moves["z"];
cube2x2x2JSON.moves["Lv"] = {
  CORNERS: {
    permutation: [1, 7, 6, 2, 0, 3, 5, 4],
    orientation: [2, 1, 2, 1, 1, 2, 1, 2],
  },
};
cube2x2x2JSON.moves["Dv"] = {
  CORNERS: {
    permutation: [3, 0, 1, 2, 5, 6, 7, 4],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};
cube2x2x2JSON.moves["Bv"] = {
  CORNERS: {
    permutation: [4, 7, 1, 0, 5, 3, 2, 6],
    orientation: [1, 2, 1, 2, 2, 1, 2, 1],
  },
};
