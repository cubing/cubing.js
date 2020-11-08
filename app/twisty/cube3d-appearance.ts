import { TwistyPlayer, Cube3D } from "../../src/twisty";
import { PieceAppearance } from "../../src/twisty/3D/puzzles/appearance";
import { parse } from "../../src/alg";

const content = document.querySelector(".content")!;

function addAlg(caseName: string, s: string): Cube3D {
  const div = content.appendChild(document.createElement("div"));
  div.classList.add("case");
  const twistyPlayer = new TwistyPlayer({
    alg: parse(s),
  });
  div.appendChild(document.createElement("h1")).textContent = caseName;
  div.appendChild(twistyPlayer);
  return twistyPlayer.twisty3D as Cube3D;
}

// regular
const r: PieceAppearance = {
  facelets: ["regular", "regular", "regular"],
};

// dim / (already) solved
const d: PieceAppearance = {
  facelets: ["dim", "dim", "dim"],
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
  facelets: ["ignored", "ignored", "ignored"],
};

// oriented
const oi: PieceAppearance = {
  facelets: ["oriented", "ignored", "ignored"],
};

const invis: PieceAppearance = {
  facelets: ["invisible", "invisible", "invisible"],
};

addAlg("COLL", "R' U' R U R' F R U R' U' R' F' R2").setAppearance({
  orbits: {
    EDGES: {
      pieces: [di, di, di, di, d, d, d, d, d, d, d, d],
    },
    CORNERS: {
      pieces: [r, r, r, r, d, d, d, d],
    },
    CENTERS: {
      pieces: [p, d, d, d, d, d],
    },
  },
});

addAlg("CLS", "R U R' U' R U R' U R U' R'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [di, di, di, di, d, d, d, d, d, d, d, d],
    },
    CORNERS: {
      pieces: [o, o, o, o, r, d, d, d],
    },
    CENTERS: {
      pieces: [d, d, d, d, d, d],
    },
  },
});

addAlg("OLL", "r U R' U R U2 r'").setAppearance({
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
});

addAlg("ELS", "[r U' r': U]").setAppearance({
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
});

addAlg("LL", "R' F R F2' U F R U R' F' U' F").setAppearance({
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
});

addAlg("ZBLL", "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R").setAppearance(
  {
    orbits: {
      EDGES: {
        pieces: [p, p, p, p, d, d, d, d, d, d, d, d],
      },
      CORNERS: {
        pieces: [r, r, r, r, d, d, d, d],
      },
      CENTERS: {
        pieces: [r, d, d, d, d, d],
      },
    },
  },
);

addAlg("ZBLS", "x' R2 U' R' U l'").setAppearance({
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
});

addAlg("WVLS", "R U R' U R U' R'").setAppearance({
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
});

addAlg("VLS", "R' F2 R F2' L' U2 L").setAppearance({
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
});

addAlg("LS", "R U' R'").setAppearance({
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
});
addAlg("EO", "").setAppearance({
  orbits: {
    EDGES: {
      pieces: [oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi, oi],
    },
    CORNERS: {
      pieces: [i, i, i, i, i, i, i, i],
    },
  },
});

addAlg("L6EO", "(U' M U' M')2").setAppearance({
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
});

addAlg("Daisy", "S2 R2 L2").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, i, i, i, i, i, i, i, i],
    },
    CORNERS: {
      pieces: [i, i, i, i, i, i, i, i],
    },
    CENTERS: {
      pieces: [d, d, d, d, d, o],
    },
  },
});

addAlg("2x2x2", "y2'").setAppearance({
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
});

addAlg("2x2x3", "y'").setAppearance({
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
});

addAlg("<R, U> EO", "").setAppearance({
  orbits: {
    EDGES: {
      pieces: [oi, oi, oi, oi, d, oi, d, d, oi, d, oi, d],
    },
    CORNERS: {
      pieces: [i, i, i, i, i, d, d, i],
    },
    CENTERS: {
      pieces: [oi, d, d, d, d, d],
    },
  },
});
