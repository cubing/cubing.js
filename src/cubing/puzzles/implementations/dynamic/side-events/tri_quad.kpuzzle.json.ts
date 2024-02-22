import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const triQuadJSON: KPuzzleDefinition = {
  name: "tri_quad",
  orbits: [
    { orbitName: "CORNERS", numPieces: 5, numOrientations: 3 },
    { orbitName: "CORNER_U", numPieces: 1, numOrientations: 4 },
    { orbitName: "CORNER_R", numPieces: 1, numOrientations: 3 },
    { orbitName: "EDGES", numPieces: 8, numOrientations: 2 },
    { orbitName: "BIG_CENTERS", numPieces: 6, numOrientations: 1 },
    { orbitName: "SMALL_CENTERS", numPieces: 13, numOrientations: 3 },
  ],
  defaultPattern: {
    CORNERS: {
      pieces: [0, 1, 2, 3, 4],
      orientation: [0, 0, 0, 0, 0],
    },
    CORNER_U: {
      pieces: [0],
      orientation: [0],
    },
    CORNER_R: {
      pieces: [0],
      orientation: [0],
    },
    EDGES: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    BIG_CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0],
    },
    SMALL_CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  moves: {
    U: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 4],
        orientationDelta: [0, 0, 0, 0, 0],
      },
      CORNER_U: {
        permutation: [0],
        orientationDelta: [3], // TODO
      },
      CORNER_R: {
        permutation: [0],
        orientationDelta: [0],
      },
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      BIG_CENTERS: {
        permutation: [1, 2, 3, 0, 4, 5],
        orientationDelta: [0, 0, 0, 0, 0, 0],
      },
      SMALL_CENTERS: {
        permutation: [2, 3, 4, 5, 6, 7, 0, 1, 8, 9, 10, 11, 12],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    R: {
      CORNERS: {
        permutation: [4, 0, 2, 3, 1],
        orientationDelta: [2, 2, 0, 0, 2],
      },
      CORNER_U: {
        permutation: [0],
        orientationDelta: [0],
      },
      CORNER_R: {
        permutation: [0],
        orientationDelta: [2],
      },
      EDGES: {
        permutation: [5, 4, 2, 3, 6, 7, 1, 0],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      BIG_CENTERS: {
        permutation: [4, 1, 2, 3, 5, 0],
        orientationDelta: [0, 0, 0, 0, 0, 0],
      },
      SMALL_CENTERS: {
        permutation: [9, 8, 7, 3, 4, 5, 6, 12, 10, 11, 1, 0, 2],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
  },
};
