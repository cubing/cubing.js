import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const cube2x2x2JSON: KPuzzleDefinition = {
  name: "2x2x2",
  orbits: [{ orbitName: "CORNERS", numPieces: 8, numOrientations: 3 }],
  defaultPattern: {
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  moves: {
    U: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    x: {
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientationDelta: [2, 1, 2, 1, 1, 2, 1, 2],
      },
    },
    y: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
  },
  derivedMoves: {
    z: "[x: y]",
    L: "[z: U]",
    F: "[x: U]",
    R: "[z': U]",
    B: "[x': U]",
    D: "[x2: U]",
    Uv: "y",
    Lv: "x'",
    Fv: "z",
    Rv: "x",
    Bv: "z'",
    Dv: "y'",
  },
};
