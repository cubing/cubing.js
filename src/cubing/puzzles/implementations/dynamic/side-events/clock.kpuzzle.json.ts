import type { KPuzzleDefinition } from "../../../../kpuzzle";
import type { KTransformationOrbitData } from "../../../../kpuzzle/KPuzzleDefinition";

const p18 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const o18 = new Array(18).fill(0);
const t18: KTransformationOrbitData = {
  permutation: p18,
  orientationDelta: o18,
};

export const clockJSON: KPuzzleDefinition = {
  name: "clock",
  orbits: [
    { orbitName: "DIALS", numPieces: 18, numOrientations: 12 },
    { orbitName: "FACES", numPieces: 18, numOrientations: 1 },
    { orbitName: "FRAME", numPieces: 1, numOrientations: 2 },
    { orbitName: "HOUR_MARKS", numPieces: 18, numOrientations: 4 },
  ],
  defaultPattern: {
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
    UL_PLUS_: {
      DIALS: {
        permutation: p18,
        orientationDelta: [
          1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0,
        ],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientationDelta: [0] },
      HOUR_MARKS: t18,
    },
    U_PLUS_: {
      DIALS: {
        permutation: p18,
        orientationDelta: [
          1, 1, 1, 1, 1, 1, 0, 0, 0, 11, 0, 11, 0, 0, 0, 0, 0, 0,
        ],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientationDelta: [0] },
      HOUR_MARKS: t18,
    },
    ALL_PLUS_: {
      DIALS: {
        permutation: p18,
        orientationDelta: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 0, 11, 0, 0, 0, 11, 0, 11,
        ],
      },
      FACES: t18,
      FRAME: { permutation: [0], orientationDelta: [0] },
      HOUR_MARKS: t18,
    },
    y2: {
      DIALS: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientationDelta: o18,
      },
      FACES: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientationDelta: o18,
      },
      FRAME: { permutation: [0], orientationDelta: [1] },
      HOUR_MARKS: {
        permutation: [
          9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1, 2, 3, 4, 5, 6, 7, 8,
        ],
        orientationDelta: o18,
      },
    },
    z: {
      DIALS: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 11, 14, 17, 10, 13, 16, 9, 12, 15,
        ],
        orientationDelta: [
          3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 9, 9, 9, 9, 9, 9, 9, 9,
        ],
      },
      FACES: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 11, 14, 17, 10, 13, 16, 9, 12, 15,
        ],
        orientationDelta: o18,
      },
      FRAME: { permutation: [0], orientationDelta: [0] },
      HOUR_MARKS: {
        permutation: [
          6, 3, 0, 7, 4, 1, 8, 5, 2, 11, 14, 17, 10, 13, 16, 9, 12, 15,
        ],
        orientationDelta: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        ],
      },
    },
  },
  derivedMoves: {
    UR_PLUS_: "[z': UL_PLUS_]",
    DR_PLUS_: "[z2: UL_PLUS_]",
    DL_PLUS_: "[z: UL_PLUS_]",

    R_PLUS_: "[z': U_PLUS_]",
    D_PLUS_: "[z2: U_PLUS_]",
    L_PLUS_: "[z: U_PLUS_]",

    F_PLUS_: "ALL_PLUS_",

    // Note: It's not possible to represent `x` without "negative"/"mirror" orientations.
    x2: "y2 z2",

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
    BMDR_PLUS_: "[y2: MDL_PLUS_']",
    BMDL_PLUS_: "[y2: MDR_PLUS_']",

    UL: ".",
    UR: ".",
    DL: ".",
    DR: ".",
  },
};
