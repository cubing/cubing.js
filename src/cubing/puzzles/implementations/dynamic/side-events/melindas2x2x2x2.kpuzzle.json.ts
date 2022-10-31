import type { KPuzzleDefinition } from "../../../../kpuzzle";

export const melindas2x2x2x2OrbitJSON: KPuzzleDefinition = {
  name: "Melinda's 2x2x2x2",
  orbits: {
    CORNERS: { numPieces: 2, numOrientations: 0 },
  },
  startStateData: {
    CORNERS: {
      pieces: [0, 1],
      orientation: [0, 0],
    },
  },
  moves: {
    _SLASH_: {
      CORNERS: {
        permutation: [1, 0],
        orientation: [0, 0],
      },
    },
  },
};
