import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const sq1HyperOrbitJSON: KPuzzleDefinition = {
  name: "Square-1",
  orbits: [
    { orbitName: "WEDGES", numPieces: 24, numOrientations: 9 },
    { orbitName: "EQUATOR", numPieces: 2, numOrientations: 6 },
  ],
  defaultPattern: {
    WEDGES: {
      pieces: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ],
      orientation: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    EQUATOR: { pieces: [0, 1], orientation: [0, 0] },
  },
  moves: {
    U_SQ_: {
      WEDGES: {
        permutation: [
          11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23,
        ],
        orientationDelta: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientationDelta: [0, 0] },
    },
    D_SQ_: {
      WEDGES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22,
        ],
        orientationDelta: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientationDelta: [0, 0] },
    },
    _SLASH_: {
      WEDGES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 6, 7, 8, 9, 10, 11, 18, 19,
          20, 21, 22, 23,
        ],
        orientationDelta: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientationDelta: [0, 3] },
    },
  },
};
