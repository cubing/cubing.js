import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const cube3x3x3KPuzzleDefinition: KPuzzleDefinition = {
  name: "3x3x3",
  orbits: {
    EDGES: { numPieces: 12, numOrientations: 2 },
    CORNERS: { numPieces: 8, numOrientations: 3 },
    CENTERS: { numPieces: 6, numOrientations: 4 },
  },
  startStateData: {
    EDGES: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0],
    },
  },
  moves: {
    U: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [1, 0, 0, 0, 0, 0],
      },
    },
    y: {
      EDGES: {
        permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientation: [1, 0, 0, 0, 0, 3],
      },
    },
    x: {
      EDGES: {
        permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientation: [2, 1, 2, 1, 1, 2, 1, 2],
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientation: [0, 3, 0, 1, 2, 2],
      },
    },
    L: {
      EDGES: {
        permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientation: [0, 0, 2, 1, 0, 2, 1, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 1, 0, 0, 0, 0],
      },
    },
    F: {
      EDGES: {
        permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11],
        orientation: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 1, 0, 0, 0],
      },
    },
    R: {
      EDGES: {
        permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientation: [2, 1, 0, 0, 1, 0, 0, 2],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 1, 0, 0],
      },
    },
    B: {
      EDGES: {
        permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2],
        orientation: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientation: [0, 2, 1, 0, 0, 0, 2, 1],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 1, 0],
      },
    },
    D: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 0, 1],
      },
    },
    z: {
      EDGES: {
        permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [3, 2, 6, 5, 0, 4, 7, 1],
        orientation: [1, 2, 1, 2, 2, 1, 2, 1],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 1, 1, 3, 1],
      },
    },
    M: {
      EDGES: {
        permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientation: [2, 0, 0, 0, 2, 0],
      },
    },
    E: {
      EDGES: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientation: [0, 0, 0, 0, 0, 0],
      },
    },
    S: {
      EDGES: {
        permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11],
        orientation: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 0, 1, 0, 1],
      },
    },
    u: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientation: [1, 0, 0, 0, 0, 0],
      },
    },
    l: {
      EDGES: {
        permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientation: [0, 0, 2, 1, 0, 2, 1, 0],
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientation: [2, 1, 0, 0, 2, 0],
      },
    },
    f: {
      EDGES: {
        permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11],
        orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 1, 1, 0, 1],
      },
    },
    r: {
      EDGES: {
        permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientation: [2, 1, 0, 0, 1, 0, 0, 2],
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientation: [0, 0, 0, 1, 2, 2],
      },
    },
    b: {
      EDGES: {
        permutation: [0, 5, 10, 1, 4, 7, 11, 3, 8, 9, 6, 2],
        orientation: [0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1],
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientation: [0, 2, 1, 0, 0, 0, 2, 1],
      },
      CENTERS: {
        permutation: [3, 0, 2, 5, 4, 1],
        orientation: [3, 3, 0, 3, 1, 3],
      },
    },
    d: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientation: [0, 0, 0, 0, 0, 1],
      },
    },
  },
};

cube3x3x3KPuzzleDefinition.moves["Uw"] = cube3x3x3KPuzzleDefinition.moves["u"];
cube3x3x3KPuzzleDefinition.moves["Lw"] = cube3x3x3KPuzzleDefinition.moves["l"];
cube3x3x3KPuzzleDefinition.moves["Fw"] = cube3x3x3KPuzzleDefinition.moves["f"];
cube3x3x3KPuzzleDefinition.moves["Rw"] = cube3x3x3KPuzzleDefinition.moves["r"];
cube3x3x3KPuzzleDefinition.moves["Bw"] = cube3x3x3KPuzzleDefinition.moves["b"];
cube3x3x3KPuzzleDefinition.moves["Dw"] = cube3x3x3KPuzzleDefinition.moves["d"];

cube3x3x3KPuzzleDefinition.moves["Rv"] = cube3x3x3KPuzzleDefinition.moves["x"];
cube3x3x3KPuzzleDefinition.moves["Uv"] = cube3x3x3KPuzzleDefinition.moves["y"];
cube3x3x3KPuzzleDefinition.moves["Fv"] = cube3x3x3KPuzzleDefinition.moves["z"];
cube3x3x3KPuzzleDefinition.moves["Lv"] = {
  EDGES: {
    permutation: [2, 10, 6, 11, 0, 8, 4, 9, 1, 3, 5, 7],
    orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  },
  CORNERS: {
    permutation: [1, 7, 6, 2, 0, 3, 5, 4],
    orientation: [2, 1, 2, 1, 1, 2, 1, 2],
  },
  CENTERS: {
    permutation: [4, 1, 0, 3, 5, 2],
    orientation: [2, 1, 0, 3, 2, 0],
  },
};
cube3x3x3KPuzzleDefinition.moves["Dv"] = {
  EDGES: {
    permutation: [3, 0, 1, 2, 7, 4, 5, 6, 9, 11, 8, 10],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  },
  CORNERS: {
    permutation: [3, 0, 1, 2, 5, 6, 7, 4],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  CENTERS: {
    permutation: [0, 4, 1, 2, 3, 5],
    orientation: [3, 0, 0, 0, 0, 1],
  },
};
cube3x3x3KPuzzleDefinition.moves["Bv"] = {
  EDGES: {
    permutation: [8, 5, 10, 1, 9, 7, 11, 3, 4, 0, 6, 2],
    orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  CORNERS: {
    permutation: [4, 7, 1, 0, 5, 3, 2, 6],
    orientation: [1, 2, 1, 2, 2, 1, 2, 1],
  },
  CENTERS: {
    permutation: [3, 0, 2, 5, 4, 1],
    orientation: [3, 3, 3, 3, 1, 3],
  },
};
