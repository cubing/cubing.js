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

// (already) solved
const s: PieceAppearance = {
  facelets: ["dim", "dim", "dim"],
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

addAlg("PLL", "R U R' U' R' F R2 U' R' U' R U R' F'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [p, p, p, p, s, s, s, s, s, s, s, s],
    },
    CORNERS: {
      pieces: [p, p, p, p, s, s, s, s],
    },
    CENTERS: {
      pieces: [p, s, s, s, s, s],
    },
  },
});

addAlg("CLS", "R U R' U' R U R' U R U' R'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [s, s, s, s, s, s, s, s, s, s, s, s],
    },
    CORNERS: {
      pieces: [o, o, o, o, r, s, s, s],
    },
    CENTERS: {
      pieces: [s, s, s, s, s, s],
    },
  },
});

addAlg("OLL", "r U R' U R U2 r'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, s, s, s, s, s, s, s, s],
    },
    CORNERS: {
      pieces: [o, o, o, o, s, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("ELS", "[r U' r': U]").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, s, s, s, s, r, s, s, s],
    },
    CORNERS: {
      pieces: [i, i, i, i, i, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("LL", "R' F R F2' U F R U R' F' U' F").setAppearance({
  orbits: {
    EDGES: {
      pieces: [r, r, r, r, s, s, s, s, s, s, s, s],
    },
    CORNERS: {
      pieces: [r, r, r, r, s, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("ZBLL", "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R").setAppearance(
  {
    orbits: {
      EDGES: {
        pieces: [r, r, r, r, s, s, s, s, s, s, s, s],
      },
      CORNERS: {
        pieces: [r, r, r, r, s, s, s, s],
      },
      CENTERS: {
        pieces: [r, s, s, s, s, s],
      },
    },
  },
);

addAlg("ZBLS", "x' R2 U' R' U l'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, s, s, s, s, r, s, s, s],
    },
    CORNERS: {
      pieces: [i, i, i, i, r, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("WVLS", "R U R' U R U' R'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, s, s, s, s, r, s, s, s],
    },
    CORNERS: {
      pieces: [i, i, i, i, r, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("VLS", "R' F2 R F2' L' U2 L").setAppearance({
  orbits: {
    EDGES: {
      pieces: [o, o, o, o, s, s, s, s, r, s, s, s],
    },
    CORNERS: {
      pieces: [o, o, o, o, r, s, s, s],
    },
    CENTERS: {
      pieces: [r, s, s, s, s, s],
    },
  },
});

addAlg("LS", "R U' R'").setAppearance({
  orbits: {
    EDGES: {
      pieces: [i, i, i, i, s, s, s, s, r, s, s, s],
    },
    CORNERS: {
      pieces: [i, i, i, i, r, s, s, s],
    },
    CENTERS: {
      pieces: [s, s, s, s, s, s],
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
      pieces: [oi, oi, oi, oi, oi, s, oi, s, s, s, s, s],
    },
    CORNERS: {
      pieces: [s, s, s, s, s, s, s, s],
    },
    CENTERS: {
      pieces: [oi, s, i, s, i, oi],
    },
  },
});
