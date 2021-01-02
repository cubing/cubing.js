import { ExperimentalStickering } from "../../dom/TwistyPlayerConfig";
import { PieceAppearance, PuzzleAppearance } from "./appearance";

// regular
const r: PieceAppearance = {
  facelets: ["regular", "regular", "regular", "regular"],
};

// dim / (already) solved
const d: PieceAppearance = {
  facelets: ["dim", "dim", "dim", "dim"], // TODO: 4th entry is for centers. Should be handled properly for all stickerings.
};

// dim / (already) oriented
const di: PieceAppearance = {
  facelets: ["dim", "ignored", "ignored"],
};

// PLL
const p: PieceAppearance = {
  facelets: ["dim", "regular", "regular"],
};

// OLL
const o: PieceAppearance = {
  facelets: ["regular", "ignored", "ignored"],
};

// ignored
const i: PieceAppearance = {
  facelets: ["ignored", "ignored", "ignored", "ignored"],
};

// oriented
const oi: PieceAppearance = {
  facelets: ["oriented", "ignored", "ignored"],
};

const invis: PieceAppearance = {
  facelets: ["invisible", "invisible", "invisible", "invisible"], // TODO: 4th entry is for void cube. Should be handled properly for all stickerings.
};

const c: PieceAppearance = {
  facelets: ["invisible", "invisible", "invisible", "invisible"],
};

// TODO: generalize stickerings by performing e.g. intersection on orbit selectors
// Example: OLL is `LL: orient, !LL: dim`
export const stickerings: Record<ExperimentalStickering, PuzzleAppearance> = {
  "full": {
    // TODO: Support elision for regular pieces.
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r],
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r],
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r],
      },
    },
  },

  "centers-only": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, i, i, i, i, i, i],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i],
      },
      CENTERS: {
        pieces: [r, r, r, r, r, r],
      },
    },
  },

  "PLL": {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [p, p, p, p, d, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "CLS": {
    orbits: {
      EDGES: {
        pieces: [di, di, di, di, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [o, o, o, o, o, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "OLL": {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [o, o, o, o, d, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },

  "COLL": {
    orbits: {
      EDGES: {
        pieces: [di, di, di, di, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "OCLL": {
    orbits: {
      EDGES: {
        pieces: [di, di, di, di, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [o, o, o, o, d, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "ELL": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "ELS": {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },

  "LL": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },

  "F2L": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, r, r, r, r],
      },
      CORNERS: {
        pieces: [i, i, i, i, r, r, r, r],
      },
      CENTERS: {
        pieces: [d, r, r, r, r, r],
      },
    },
  },

  "ZBLL": {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "ZBLS": {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d],
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },

  "WVLS": {
    orbits: {
      EDGES: {
        pieces: [d, d, d, d, d, d, d, d, r, d, d, d],
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "VLS": {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, d, d, d, d, r, d, d, d],
      },
      CORNERS: {
        pieces: [o, o, o, o, r, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },

  "LS": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, d, d, d, d, r, d, d, d],
      },
      CORNERS: {
        pieces: [i, i, i, i, r, d, d, d],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, d],
      },
    },
  },

  "EO": {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i],
      },
    },
  },

  "CMLL": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, d, i, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d],
      },
      CENTERS: {
        pieces: [i, d, i, d, i, i],
      },
    },
  },

  "L6E": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, d, r, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, r, d, r, r],
      },
    },
  },

  "L6EO": {
    orbits: {
      EDGES: {
        pieces: [oi, oi, oi, oi, oi, d, oi, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [d, d, d, d, d, d, d, d],
      },
      CENTERS: {
        pieces: [oi, d, i, d, i, oi],
      },
    },
  },

  "Daisy": {
    orbits: {
      EDGES: {
        pieces: [o, o, o, o, i, i, i, i, i, i, i, i],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, r],
      },
    },
  },

  // TODO: U? This doesn't match daisy.
  "Cross": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, r, r, r, i, i, i, i],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, i, i],
      },
      CENTERS: {
        pieces: [d, d, d, d, d, r],
      },
    },
  },

  "2x2x2": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, i, i, r, r, i, i, i, r],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, i, r, i],
      },
      CENTERS: {
        pieces: [d, r, d, d, r, r],
      },
    },
  },

  "2x2x3": {
    orbits: {
      EDGES: {
        pieces: [i, i, i, i, r, i, d, d, i, r, i, d],
      },
      CORNERS: {
        pieces: [i, i, i, i, i, r, d, i],
      },
      CENTERS: {
        pieces: [d, d, r, d, d, d],
      },
    },
  },

  // TODO: remove foundations
  "Void Cube": {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, r, r, r, r, r, r, r, r],
      },
      CORNERS: {
        pieces: [r, r, r, r, r, r, r, r],
      },
      CENTERS: {
        pieces: [invis, invis, invis, invis, invis, invis],
      },
    },
  },

  // TODO: remove foundations
  "invisible": {
    orbits: {
      EDGES: {
        pieces: [
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
          invis,
        ],
      },
      CORNERS: {
        pieces: [invis, invis, invis, invis, invis, invis, invis, invis],
      },
      CENTERS: {
        pieces: [invis, invis, invis, invis, invis, invis],
      },
    },
  },

  "picture": {
    // TODO: Support elision for regular pieces.
    orbits: {
      EDGES: {
        pieces: [c, c, c, c, c, c, c, c, c, c, c, c],
      },
      CORNERS: {
        pieces: [c, c, c, c, c, c, c, c],
      },
      CENTERS: {
        pieces: [c, c, c, c, c, c],
      },
    },
  },
};
