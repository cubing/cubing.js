import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const melindas2x2x2x2OrbitJSON: KPuzzleDefinition = {
  name: "Melinda's 2x2x2x2",
  orbits: {
    CORNERS: { numPieces: 4, numOrientations: 1 },
  },
  startStateData: {
    CORNERS: {
      pieces: [0, 1, 2, 3],
      orientation: [0, 0, 0, 0],
    },
  },
  moves: {
    _SLASH_: {
      CORNERS: {
        permutation: [1, 2, 3, 0],
        orientation: [0, 0, 0, 0],
      },
    },
  },
};
