import type { KPuzzleDefinition } from "../../../../kpuzzle";

const o = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

export const loopoverJSON: KPuzzleDefinition = {
  name: "2x2x2",
  orbits: [{ orbitName: "SQUARES", numPieces: 25, numOrientations: 3 }],
  defaultPattern: {
    SQUARES: {
      pieces: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24,
      ],
      orientation: o,
    },
  },
  moves: {
    U: {
      SQUARES: {
        permutation: [
          1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "2U": {
      SQUARES: {
        permutation: [
          0, 1, 2, 3, 4, 6, 7, 8, 9, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "3U": {
      SQUARES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 10, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "4U": {
      SQUARES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 15,
          20, 21, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "5U": {
      SQUARES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          21, 22, 23, 24, 20,
        ],
        orientationDelta: o,
      },
    },
    R: {
      SQUARES: {
        permutation: [
          0, 1, 2, 3, 9, 5, 6, 7, 8, 14, 10, 11, 12, 13, 19, 15, 16, 17, 18, 24,
          20, 21, 22, 23, 4,
        ],
        orientationDelta: o,
      },
    },
    "2R": {
      SQUARES: {
        permutation: [
          0, 1, 2, 8, 4, 5, 6, 7, 13, 9, 10, 11, 12, 18, 14, 15, 16, 17, 23, 19,
          20, 21, 22, 3, 24,
        ],
        orientationDelta: o,
      },
    },
    "3R": {
      SQUARES: {
        permutation: [
          0, 1, 7, 3, 4, 5, 6, 12, 8, 9, 10, 11, 17, 13, 14, 15, 16, 22, 18, 19,
          20, 21, 2, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "4R": {
      SQUARES: {
        permutation: [
          0, 6, 2, 3, 4, 5, 11, 7, 8, 9, 10, 16, 12, 13, 14, 15, 21, 17, 18, 19,
          20, 1, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
    "5R": {
      SQUARES: {
        permutation: [
          5, 1, 2, 3, 4, 10, 6, 7, 8, 9, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19,
          0, 21, 22, 23, 24,
        ],
        orientationDelta: o,
      },
    },
  },
  derivedMoves: {
    L: "5R'",
    "2L": "4R'",
    "3L": "3R'",
    "4L": "2R'",
    "5L": "R'",
    D: "5U'",
    "2D": "4U'",
    "3D": "3U'",
    "4D": "2U'",
    "5D": "U'",
    E: "3D",
    M: "3L",
  },
};
