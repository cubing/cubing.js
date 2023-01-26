import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const clockJSON: KPuzzleDefinition = {
  name: "clock",
  orbits: {
    DIALS: { numPieces: 18, numOrientations: 12 },
    FACES: { numPieces: 18, numOrientations: 1 },
    FRAME: { numPieces: 1, numOrientations: 2 },
  },
  startStateData: {
    DIALS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    FACES: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    FRAME: { pieces: [0], orientation: [0] },
  },
  moves: {
    UR_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 1, 1, 0, 1, 1, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    DR_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    DL_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    UL_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    U_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [1, 1, 1, 1, 1, 1, 0, 0, 0, 11, 0, 11, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    R_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 1, 1, 0, 1, 1, 0, 1, 1, 11, 0, 0, 0, 0, 0, 11, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    D_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 11],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    L_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 11, 0, 0, 0, 0, 0, 11],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    ALL_PLUS_: {
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 0, 11, 0, 0, 0, 11, 0, 11],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    y2: {
      DIALS: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [1] },
    },
    UL: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    UR: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    DL: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
    DR: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: {
        permutation: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: { permutation: [0], orientation: [0] },
    },
  },
  experimentalDerivedMoves: {
    // TODO: moves with diagonally opposite pins?
    B_PLUS_: "[y2: ALL_PLUS_']",
    BU_PLUS_: "[y2: U_PLUS_']",
    BR_PLUS_: "[y2: L_PLUS_']",
    BD_PLUS_: "[y2: D_PLUS_']",
    BL_PLUS_: "[y2: R_PLUS_']",
    BUR_PLUS_: "[y2: UL_PLUS_']",
    BUL_PLUS_: "[y2: UR_PLUS_']",
    BDL_PLUS_: "[y2: DR_PLUS_']",
    BDR_PLUS_: "[y2: DL_PLUS_']",
  },
};
