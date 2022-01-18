import type { OldKPuzzleDefinition } from "../../../kpuzzle";

export const sq1HyperOrbitKPuzzle: OldKPuzzleDefinition = {
  name: "Square-1",
  orbits: {
    WEDGES: { numPieces: 24, orientations: 9 },
    EQUATOR: { numPieces: 2, orientations: 6 },
  },
  startPieces: {
    WEDGES: {
      permutation: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ],
      orientation: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
  },
  moves: {
    U_SQ_: {
      WEDGES: {
        permutation: [
          11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23,
        ],
        orientation: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
    },
    D_SQ_: {
      WEDGES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 23, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22,
        ],
        orientation: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientation: [0, 0] },
    },
    _SLASH_: {
      WEDGES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 6, 7, 8, 9, 10, 11, 18, 19,
          20, 21, 22, 23,
        ],
        orientation: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0,
        ],
      },
      EQUATOR: { permutation: [0, 1], orientation: [0, 3] },
    },
  },
};
