import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const cube3x3x3KPuzzleDefinition: KPuzzleDefinition = {
  name: "3x3x3",
  orbits: [
    { orbitName: "EDGES", numPieces: 12, numOrientations: 2 },
    { orbitName: "CORNERS", numPieces: 8, numOrientations: 3 },
    { orbitName: "CENTERS", numPieces: 6, numOrientations: 4 },
  ],
  defaultPattern: {
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
      orientationMod: [1, 1, 1, 1, 1, 1],
    },
  },
  moves: {
    U: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [1, 0, 0, 0, 0, 0],
      },
    },
    y: {
      EDGES: {
        permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientationDelta: [1, 0, 0, 0, 0, 3],
      },
    },
    x: {
      EDGES: {
        permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientationDelta: [2, 1, 2, 1, 1, 2, 1, 2],
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientationDelta: [0, 3, 0, 1, 2, 2],
      },
    },
    L: {
      EDGES: {
        permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientationDelta: [0, 0, 2, 1, 0, 2, 1, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 1, 0, 0, 0, 0],
      },
    },
    F: {
      EDGES: {
        permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11],
        orientationDelta: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientationDelta: [1, 0, 0, 2, 2, 1, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 1, 0, 0, 0],
      },
    },
    R: {
      EDGES: {
        permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientationDelta: [2, 1, 0, 0, 1, 0, 0, 2],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 1, 0, 0],
      },
    },
    B: {
      EDGES: {
        permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2],
        orientationDelta: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientationDelta: [0, 2, 1, 0, 0, 0, 2, 1],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 0, 1, 0],
      },
    },
    D: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 0, 0, 1],
      },
    },
    z: {
      EDGES: {
        permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6],
        orientationDelta: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [3, 2, 6, 5, 0, 4, 7, 1],
        orientationDelta: [1, 2, 1, 2, 2, 1, 2, 1],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 1, 1, 3, 1],
      },
    },
    M: {
      EDGES: {
        permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientationDelta: [2, 0, 0, 0, 2, 0],
      },
    },
    E: {
      EDGES: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientationDelta: [0, 0, 0, 0, 0, 0],
      },
    },
    S: {
      EDGES: {
        permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11],
        orientationDelta: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 0, 1, 0, 1],
      },
    },
    u: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientationDelta: [1, 0, 0, 0, 0, 0],
      },
    },
    l: {
      EDGES: {
        permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientationDelta: [0, 0, 2, 1, 0, 2, 1, 0],
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientationDelta: [2, 1, 0, 0, 2, 0],
      },
    },
    f: {
      EDGES: {
        permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11],
        orientationDelta: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientationDelta: [1, 0, 0, 2, 2, 1, 0, 0],
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 1, 1, 0, 1],
      },
    },
    r: {
      EDGES: {
        permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientationDelta: [2, 1, 0, 0, 1, 0, 0, 2],
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientationDelta: [0, 0, 0, 1, 2, 2],
      },
    },
    b: {
      EDGES: {
        permutation: [0, 5, 10, 1, 4, 7, 11, 3, 8, 9, 6, 2],
        orientationDelta: [0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1],
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientationDelta: [0, 2, 1, 0, 0, 0, 2, 1],
      },
      CENTERS: {
        permutation: [3, 0, 2, 5, 4, 1],
        orientationDelta: [3, 3, 0, 3, 1, 3],
      },
    },
    d: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientationDelta: [0, 0, 0, 0, 0, 1],
      },
    },
  },
  derivedMoves: {
    Uw: "u",
    Lw: "l",
    Fw: "f",
    Rw: "r",
    Bw: "b",
    Dw: "d",

    Uv: "y",
    Lv: "x'",
    Fv: "z",
    Rv: "x",
    Bv: "z'",
    Dv: "y'",

    "2U": "u U'",
    "2L": "l L'",
    "2F": "f F'",
    "2R": "r R'",
    "2B": "b B'",
    "2D": "d D'",
  },
};
