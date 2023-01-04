import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const cube2x2x2JSON: KPuzzleDefinition = {
  name: "2x2x2",
  orbits: {
    CORNERS: { numPieces: 8, numOrientations: 3 },
  },
  startStateData: {
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  moves: {
    U: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    y: {
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    x: {
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientation: [2, 1, 2, 1, 1, 2, 1, 2],
      },
    },
  },
  experimentalDerivedMoves: {
    z: "x y",
    L: "[z: U]",
    F: "[x: U]",
    R: "[z': U]",
    B: "[x': U]",
    D: "[x2: U]",
  },
};

cube2x2x2JSON.moves["Rv"] = cube2x2x2JSON.moves["x"];
cube2x2x2JSON.moves["Uv"] = cube2x2x2JSON.moves["y"];
cube2x2x2JSON.moves["Fv"] = cube2x2x2JSON.moves["z"];
cube2x2x2JSON.moves["Lv"] = {
  CORNERS: {
    permutation: [1, 7, 6, 2, 0, 3, 5, 4],
    orientation: [2, 1, 2, 1, 1, 2, 1, 2],
  },
};
cube2x2x2JSON.moves["Dv"] = {
  CORNERS: {
    permutation: [3, 0, 1, 2, 5, 6, 7, 4],
    orientation: [0, 0, 0, 0, 0, 0, 0, 0],
  },
};
cube2x2x2JSON.moves["Bv"] = {
  CORNERS: {
    permutation: [4, 7, 1, 0, 5, 3, 2, 6],
    orientation: [1, 2, 1, 2, 2, 1, 2, 1],
  },
};
