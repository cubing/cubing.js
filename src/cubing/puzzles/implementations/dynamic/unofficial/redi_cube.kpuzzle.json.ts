import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const rediCubeJSON: KPuzzleDefinition = {
  name: "redi_cube",
  orbits: [
    { orbitName: "EDGES", numPieces: 12, numOrientations: 2 },
    { orbitName: "CORNERS", numPieces: 8, numOrientations: 3 },
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
  },
  moves: {
    F: {
      EDGES: {
        permutation: [8, 0, 2, 3, 4, 5, 6, 7, 1, 9, 10, 11],
        orientationDelta: [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [1, 0, 0, 0, 0, 0, 0, 0],
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
    },
  },
  derivedMoves: {
    z: "[x: y]",
    UR: "[y: F]",
    U: "[y2: F]",
    UL: "[y': F]",
    D: "[x: F]",
    L: "[z2: F]",
    R: "[x2: F]",
    B: "[y2 x: F]",
  },
};
