import type { KPuzzleDefinition } from "../../../../kpuzzle";
import type { KTransformationOrbitData } from "../../../../kpuzzle/KPuzzleDefinition";

const p18 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const o18 = new Array(18).fill(0);
const t18: KTransformationOrbitData = {
  permutation: p18,
  orientation: o18,
};

export const clockJSON: KPuzzleDefinition = {
  name: "clock",
  orbits: {
    DIALS: { numPieces: 18, numOrientations: 12 },
    FACES: { numPieces: 18, numOrientations: 1 },
    FRAME: { numPieces: 1, numOrientations: 2 },
    HOUR_MARKS: { numPieces: 18, numOrientations: 4 },
  },
  startStateData: {
    DIALS: {
      pieces: p18,
      orientation: o18,
    },
    FACES: {
      pieces: p18,
      orientation: o18,
    },
    FRAME: { pieces: [0], orientation: [0] },
    HOUR_MARKS: {
      pieces: p18,
      orientation: o18,
    },
  },
  moves: {
    UR_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [0, 1, 1, 0, 1, 1, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    DR_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 0],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    DL_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    UL_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    U_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [1, 1, 1, 1, 1, 1, 0, 0, 0, 11, 0, 11, 0, 0, 0, 0, 0, 0],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    R_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [0, 1, 1, 0, 1, 1, 0, 1, 1, 11, 0, 0, 0, 0, 0, 11, 0, 0],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    D_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 11],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    L_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 11, 0, 0, 0, 0, 0, 11],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    ALL_PLUS_: {
      DIALS: {
        permutation: p18,
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 0, 11, 0, 0, 0, 11, 0, 11],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    y2: {
      DIALS: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: o18,
      },
      FACES: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: o18,
      },
      FRAME: { permutation: [0], orientation: [1] },
      HOUR_MARKS: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: o18,
      },
    },
    z: {
      DIALS: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 17, 14, 11, 16, 13, 10, 15, 12, 9,
        ],
        orientation: new Array(18).fill(3),
      },
      FACES: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 17, 14, 11, 16, 13, 10, 15, 12, 9,
        ],
        orientation: o18,
      },
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 17, 14, 11, 16, 13, 10, 15, 12, 9,
        ],
        orientation: new Array(18).fill(1),
      },
    },
    // TODO: define this as `z2 y2`
    x2: {
      DIALS: {
        permutation: [
          17, 16, 15, 14, 13, 12, 11, 10, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      },
      FACES: {
        permutation: [
          17, 16, 15, 14, 13, 12, 11, 10, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      FRAME: {
        permutation: [0],
        orientation: [1],
      },
      HOUR_MARKS: {
        permutation: [
          17, 16, 15, 14, 13, 12, 11, 10, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientation: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      },
    },
    UL: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: t18,
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    UR: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: t18,
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    DL: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: t18,
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
    DR: {
      // TODO: define "pin up" as something other than a normal move.
      DIALS: t18,
      FACES: t18,
      FRAME: { permutation: [0], orientation: [0] },
      HOUR_MARKS: t18,
    },
  },
  experimentalDerivedMoves: {
    // x2: "y2 z2", // TODO(https://github.com/cubing/cubing.js/issues/279)

    ULw_PLUS_: "U_PLUS_ L_PLUS_ UL_PLUS_'",
    URw_PLUS_: "U_PLUS_ R_PLUS_ UR_PLUS_'",
    DLw_PLUS_: "D_PLUS_ L_PLUS_ DL_PLUS_'",
    DRw_PLUS_: "D_PLUS_ R_PLUS_ DR_PLUS_'",

    BULw_PLUS_: "[y2: URw_PLUS_']",
    BURw_PLUS_: "[y2: ULw_PLUS_']",
    BDLw_PLUS_: "[y2: DRw_PLUS_']",
    BDRw_PLUS_: "[y2: DLw_PLUS_']",

    B_PLUS_: "[y2: ALL_PLUS_']",
    BU_PLUS_: "[y2: U_PLUS_']",
    BR_PLUS_: "[y2: L_PLUS_']",
    BD_PLUS_: "[y2: D_PLUS_']",
    BL_PLUS_: "[y2: R_PLUS_']",
    BUR_PLUS_: "[y2: UL_PLUS_']",
    BUL_PLUS_: "[y2: UR_PLUS_']",
    BDL_PLUS_: "[y2: DR_PLUS_']",
    BDR_PLUS_: "[y2: DL_PLUS_']",

    MUL_PLUS_: "UR_PLUS_' DL_PLUS_' U_PLUS_ R_PLUS_ D_PLUS_ L_PLUS_ ALL_PLUS_'",
    MUR_PLUS_: "UL_PLUS_' DR_PLUS_' U_PLUS_ L_PLUS_ D_PLUS_ R_PLUS_ ALL_PLUS_'",
    MDR_PLUS_: "MUL_PLUS_",
    MDL_PLUS_: "MUR_PLUS_",

    BMUL_PLUS_: "[y2: MUR_PLUS_']",
    BMUR_PLUS_: "[y2: MUL_PLUS_']",
    BMDR_PLUS_: "[y2: MDR_PLUS_']",
    BMDL_PLUS_: "[y2: MDL_PLUS_']",
  },
};
