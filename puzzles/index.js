// src/cubing/puzzles/stickerings/appearance.ts
import {Move} from "cubing/alg";
import {experimentalIs} from "cubing/alg";
import {transformationForMove} from "cubing/kpuzzle";
function getFaceletAppearance(appearance, orbitName, pieceIdx, faceletIdx, hint) {
  const orbitAppearance = appearance.orbits[orbitName];
  const pieceAppearance = orbitAppearance.pieces[pieceIdx];
  if (pieceAppearance === null) {
    return regular;
  }
  const faceletAppearance = pieceAppearance.facelets[faceletIdx];
  if (faceletAppearance === null) {
    return regular;
  }
  if (typeof faceletAppearance === "string") {
    return faceletAppearance;
  }
  if (hint) {
    return faceletAppearance.hintAppearance ?? faceletAppearance.appearance;
  }
  return faceletAppearance.appearance;
}
var PieceStickering;
(function(PieceStickering2) {
  PieceStickering2[PieceStickering2["Regular"] = 0] = "Regular";
  PieceStickering2[PieceStickering2["Dim"] = 1] = "Dim";
  PieceStickering2[PieceStickering2["Ignored"] = 2] = "Ignored";
  PieceStickering2[PieceStickering2["OrientationStickers"] = 3] = "OrientationStickers";
  PieceStickering2[PieceStickering2["Invisible"] = 4] = "Invisible";
  PieceStickering2[PieceStickering2["Ignoriented"] = 5] = "Ignoriented";
  PieceStickering2[PieceStickering2["IgnoreNonPrimary"] = 6] = "IgnoreNonPrimary";
  PieceStickering2[PieceStickering2["PermuteNonPrimary"] = 7] = "PermuteNonPrimary";
  PieceStickering2[PieceStickering2["OrientationWithoutPermutation"] = 8] = "OrientationWithoutPermutation";
})(PieceStickering || (PieceStickering = {}));
var PieceAnnotation = class {
  constructor(def, defaultValue) {
    this.stickerings = new Map();
    for (const [orbitName, orbitDef] of Object.entries(def.orbits)) {
      this.stickerings.set(orbitName, new Array(orbitDef.numPieces).fill(defaultValue));
    }
  }
};
var regular = "regular";
var ignored = "ignored";
var oriented = "oriented";
var invisible = "invisible";
var dim = "dim";
var r = {
  facelets: [regular, regular, regular, regular, regular]
};
var i = {
  facelets: [ignored, ignored, ignored, ignored, ignored]
};
var o = {
  facelets: [oriented, oriented, oriented, oriented, oriented]
};
var invisiblePiece = {
  facelets: [invisible, invisible, invisible, invisible]
};
var riiii = {
  facelets: [regular, ignored, ignored, ignored, ignored]
};
var drrrr = {
  facelets: [dim, regular, regular, regular, regular]
};
var d = {
  facelets: [dim, dim, dim, dim, dim]
};
var diiii = {
  facelets: [dim, ignored, ignored, ignored, ignored]
};
var oiiii = {
  facelets: [oriented, ignored, ignored, ignored, ignored]
};
function getPieceAppearance(pieceStickering) {
  switch (pieceStickering) {
    case 0:
      return r;
    case 1:
      return d;
    case 2:
      return i;
    case 3:
      return o;
    case 4:
      return invisiblePiece;
    case 6:
      return riiii;
    case 7:
      return drrrr;
    case 5:
      return diiii;
    case 8:
      return oiiii;
  }
}
var PuzzleStickering = class extends PieceAnnotation {
  constructor(def) {
    super(def, 0);
  }
  set(pieceSet, pieceStickering) {
    for (const [orbitName, pieces] of this.stickerings.entries()) {
      for (let i2 = 0; i2 < pieces.length; i2++) {
        if (pieceSet.stickerings.get(orbitName)[i2]) {
          pieces[i2] = pieceStickering;
        }
      }
    }
    return this;
  }
  toAppearance() {
    const appearance = {orbits: {}};
    for (const [orbitName, pieceStickerings] of this.stickerings.entries()) {
      const pieces = [];
      const orbitAppearance = {
        pieces
      };
      appearance.orbits[orbitName] = orbitAppearance;
      for (const pieceStickering of pieceStickerings) {
        pieces.push(getPieceAppearance(pieceStickering));
      }
    }
    return appearance;
  }
};
var StickeringManager = class {
  constructor(def) {
    this.def = def;
  }
  and(pieceSets) {
    const newPieceSet = new PieceAnnotation(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      pieceLoop:
        for (let i2 = 0; i2 < orbitDef.numPieces; i2++) {
          newPieceSet.stickerings.get(orbitName)[i2] = true;
          for (const pieceSet of pieceSets) {
            if (!pieceSet.stickerings.get(orbitName)[i2]) {
              newPieceSet.stickerings.get(orbitName)[i2] = false;
              continue pieceLoop;
            }
          }
        }
    }
    return newPieceSet;
  }
  or(pieceSets) {
    const newPieceSet = new PieceAnnotation(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      pieceLoop:
        for (let i2 = 0; i2 < orbitDef.numPieces; i2++) {
          newPieceSet.stickerings.get(orbitName)[i2] = false;
          for (const pieceSet of pieceSets) {
            if (pieceSet.stickerings.get(orbitName)[i2]) {
              newPieceSet.stickerings.get(orbitName)[i2] = true;
              continue pieceLoop;
            }
          }
        }
    }
    return newPieceSet;
  }
  not(pieceSet) {
    const newPieceSet = new PieceAnnotation(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      for (let i2 = 0; i2 < orbitDef.numPieces; i2++) {
        newPieceSet.stickerings.get(orbitName)[i2] = !pieceSet.stickerings.get(orbitName)[i2];
      }
    }
    return newPieceSet;
  }
  all() {
    return this.and(this.moves([]));
  }
  move(moveSource) {
    const transformation = transformationForMove(this.def, experimentalIs(moveSource, Move) ? moveSource : Move.fromString(moveSource));
    const newPieceSet = new PieceAnnotation(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      for (let i2 = 0; i2 < orbitDef.numPieces; i2++) {
        if (transformation[orbitName].permutation[i2] !== i2 || transformation[orbitName].orientation[i2] !== 0) {
          newPieceSet.stickerings.get(orbitName)[i2] = true;
        }
      }
    }
    return newPieceSet;
  }
  moves(moveSources) {
    return moveSources.map((moveSource) => this.move(moveSource));
  }
};

// src/cubing/puzzles/stickerings/cube-stickerings.ts
async function cubeAppearance(puzzleLoader, stickering) {
  const def = await puzzleLoader.def();
  const puzzleStickering = new PuzzleStickering(def);
  const m = new StickeringManager(def);
  const LL = () => m.move("U");
  const orUD = () => m.or(m.moves(["U", "D"]));
  const E = () => m.not(orUD());
  const orLR = () => m.or(m.moves(["L", "R"]));
  const M = () => m.not(orLR());
  const orFB = () => m.or(m.moves(["F", "B"]));
  const S = () => m.not(orFB());
  const F2L = () => m.not(LL());
  const centerU = () => m.and([LL(), M(), S()]);
  const edgeFR = () => m.and([m.and(m.moves(["F", "R"])), m.not(orUD())]);
  const cornerDFR = () => m.and(m.moves(["D", "R", "F"]));
  const slotFR = () => m.or([cornerDFR(), edgeFR()]);
  const CENTERS = () => m.or([m.and([M(), E()]), m.and([M(), S()]), m.and([E(), S()])]);
  const EDGES = () => m.or([
    m.and([M(), orUD(), orFB()]),
    m.and([E(), orLR(), orFB()]),
    m.and([S(), orUD(), orLR()])
  ]);
  const CORNERS = () => m.not(m.or([CENTERS(), EDGES()]));
  const L6E = () => m.or([M(), m.and([LL(), EDGES()])]);
  function dimF2L() {
    puzzleStickering.set(F2L(), PieceStickering.Dim);
  }
  function setPLL() {
    puzzleStickering.set(LL(), PieceStickering.PermuteNonPrimary);
    puzzleStickering.set(centerU(), PieceStickering.Dim);
  }
  function setOLL() {
    puzzleStickering.set(LL(), PieceStickering.IgnoreNonPrimary);
    puzzleStickering.set(centerU(), PieceStickering.Regular);
  }
  function dimOLL() {
    puzzleStickering.set(LL(), PieceStickering.Ignoriented);
    puzzleStickering.set(centerU(), PieceStickering.Dim);
  }
  switch (stickering) {
    case "full":
      break;
    case "PLL":
      dimF2L();
      setPLL();
      break;
    case "CLS":
      dimF2L();
      puzzleStickering.set(m.and(m.moves(["D", "R", "F"])), PieceStickering.Regular);
      puzzleStickering.set(LL(), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.IgnoreNonPrimary);
      break;
    case "OLL":
      dimF2L();
      setOLL();
      break;
    case "COLL":
      dimF2L();
      setPLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    case "OCLL":
      dimF2L();
      dimOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.IgnoreNonPrimary);
      break;
    case "CLL":
      dimF2L();
      puzzleStickering.set(m.not(m.and([CORNERS(), LL()])), PieceStickering.Dim);
      break;
    case "ELL":
      dimF2L();
      puzzleStickering.set(LL(), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL(), EDGES()]), PieceStickering.Regular);
      break;
    case "ELS":
      dimF2L();
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      puzzleStickering.set(edgeFR(), PieceStickering.Regular);
      puzzleStickering.set(cornerDFR(), PieceStickering.Ignored);
      break;
    case "LL":
      dimF2L();
      break;
    case "F2L":
      puzzleStickering.set(LL(), PieceStickering.Ignored);
      break;
    case "ZBLL":
      dimF2L();
      puzzleStickering.set(LL(), PieceStickering.PermuteNonPrimary);
      puzzleStickering.set(centerU(), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    case "ZBLS":
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      break;
    case "WVLS":
    case "VLS":
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      break;
    case "LS":
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      puzzleStickering.set(LL(), PieceStickering.Ignored);
      puzzleStickering.set(centerU(), PieceStickering.Dim);
      break;
    case "EO":
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      puzzleStickering.set(EDGES(), PieceStickering.OrientationWithoutPermutation);
      break;
    case "CMLL":
      puzzleStickering.set(F2L(), PieceStickering.Dim);
      puzzleStickering.set(L6E(), PieceStickering.Ignored);
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    case "L6E":
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      break;
    case "L6EO":
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      puzzleStickering.set(L6E(), PieceStickering.OrientationWithoutPermutation);
      puzzleStickering.set(m.and([CENTERS(), orUD()]), PieceStickering.OrientationStickers);
      break;
    case "Daisy":
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(m.and([m.move("D"), CENTERS()]), PieceStickering.Regular);
      puzzleStickering.set(m.and([m.move("U"), EDGES()]), PieceStickering.IgnoreNonPrimary);
      break;
    case "Cross":
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(m.and([m.move("D"), CENTERS()]), PieceStickering.Regular);
      puzzleStickering.set(m.and([m.move("D"), EDGES()]), PieceStickering.Regular);
      break;
    case "2x2x2":
      puzzleStickering.set(m.or(m.moves(["U", "F", "R"])), PieceStickering.Ignored);
      puzzleStickering.set(m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]), PieceStickering.Dim);
      break;
    case "2x2x3":
      puzzleStickering.set(m.all(), PieceStickering.Dim);
      puzzleStickering.set(m.or(m.moves(["U", "F", "R"])), PieceStickering.Ignored);
      puzzleStickering.set(m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(m.and([m.move("F"), m.not(m.or(m.moves(["U", "R"])))]), PieceStickering.Regular);
      break;
    case "Void Cube":
      puzzleStickering.set(CENTERS(), PieceStickering.Invisible);
      break;
    case "picture":
    case "invisible":
      puzzleStickering.set(m.all(), PieceStickering.Invisible);
      break;
    case "centers-only":
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    default:
      console.warn(`Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`);
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering.toAppearance();
}
async function cubeStickerings() {
  return [
    "full",
    "PLL",
    "CLS",
    "OLL",
    "COLL",
    "OCLL",
    "ELL",
    "ELS",
    "LL",
    "F2L",
    "ZBLL",
    "ZBLS",
    "WVLS",
    "VLS",
    "LS",
    "EO",
    "CMLL",
    "L6E",
    "L6EO",
    "Daisy",
    "Cross",
    "2x2x2",
    "2x2x3",
    "Void Cube",
    "picture",
    "invisible",
    "centers-only"
  ];
}

// src/cubing/puzzles/async/async-pg3d.ts
async function asyncGetPuzzleGeometry(puzzleName) {
  const puzzleGeometry = await import("cubing/puzzle-geometry");
  return puzzleGeometry.getPuzzleGeometryByName(puzzleName, [
    "allmoves",
    "true",
    "orientcenters",
    "true",
    "rotations",
    "true"
  ]);
}
async function asyncGetDef(puzzleName) {
  return (await asyncGetPuzzleGeometry(puzzleName)).writekpuzzle(true);
}
function genericPGPuzzleLoader(id, fullName, info) {
  const puzzleLoader = {
    id,
    fullName,
    def: async () => {
      return asyncGetDef(id);
    },
    svg: async () => {
      const pg = await asyncGetPuzzleGeometry(id);
      return pg.generatesvg();
    },
    pg: async () => {
      return asyncGetPuzzleGeometry(id);
    }
  };
  if (info?.inventedBy) {
    puzzleLoader.inventedBy = info.inventedBy;
  }
  if (info?.inventionYear) {
    puzzleLoader.inventionYear = info.inventionYear;
  }
  return puzzleLoader;
}
function cubePGPuzzleLoader(id, fullName, info) {
  const puzzleLoader = genericPGPuzzleLoader(id, fullName, info);
  puzzleLoader.appearance = cubeAppearance.bind(cubeAppearance, puzzleLoader);
  puzzleLoader.stickerings = cubeStickerings;
  return puzzleLoader;
}

// src/cubing/puzzles/implementations/2x2x2/index.ts
var cube2x2x2 = {
  id: "2x2x2",
  fullName: "2\xD72\xD72 Cube",
  def: async () => {
    return await import("./implementations/2x2x2/2x2x2.kpuzzle.js");
  },
  svg: async () => {
    return (await import("./implementations/2x2x2/2x2x2.kpuzzle.svg.js")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("2x2x2");
  },
  appearance: (stickering) => cubeAppearance(cube2x2x2, stickering),
  stickerings: cubeStickerings
};

// src/cubing/puzzles/implementations/3x3x3/3x3x3.kpuzzle.json_.ts
var cube3x3x3KPuzzle = {
  name: "3x3x3",
  orbits: {
    EDGES: {numPieces: 12, orientations: 2},
    CORNERS: {numPieces: 8, orientations: 3},
    CENTERS: {numPieces: 6, orientations: 4}
  },
  startPieces: {
    EDGES: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      permutation: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      permutation: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0]
    }
  },
  moves: {
    U: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [1, 0, 0, 0, 0, 0]
      }
    },
    y: {
      EDGES: {
        permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientation: [1, 0, 0, 0, 0, 3]
      }
    },
    x: {
      EDGES: {
        permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientation: [2, 1, 2, 1, 1, 2, 1, 2]
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientation: [0, 3, 0, 1, 2, 2]
      }
    },
    L: {
      EDGES: {
        permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientation: [0, 0, 2, 1, 0, 2, 1, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 1, 0, 0, 0, 0]
      }
    },
    F: {
      EDGES: {
        permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11],
        orientation: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 1, 0, 0, 0]
      }
    },
    R: {
      EDGES: {
        permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientation: [2, 1, 0, 0, 1, 0, 0, 2]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 1, 0, 0]
      }
    },
    B: {
      EDGES: {
        permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2],
        orientation: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientation: [0, 2, 1, 0, 0, 0, 2, 1]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 1, 0]
      }
    },
    D: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientation: [0, 0, 0, 0, 0, 1]
      }
    },
    z: {
      EDGES: {
        permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6],
        orientation: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [3, 2, 6, 5, 0, 4, 7, 1],
        orientation: [1, 2, 1, 2, 2, 1, 2, 1]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 1, 1, 3, 1]
      }
    },
    M: {
      EDGES: {
        permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientation: [2, 0, 0, 0, 2, 0]
      }
    },
    E: {
      EDGES: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientation: [0, 0, 0, 0, 0, 0]
      }
    },
    S: {
      EDGES: {
        permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11],
        orientation: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 0, 1, 0, 1]
      }
    },
    u: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientation: [1, 0, 0, 0, 0, 0]
      }
    },
    l: {
      EDGES: {
        permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientation: [0, 0, 2, 1, 0, 2, 1, 0]
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientation: [2, 1, 0, 0, 2, 0]
      }
    },
    f: {
      EDGES: {
        permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11],
        orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientation: [1, 1, 1, 1, 0, 1]
      }
    },
    r: {
      EDGES: {
        permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11],
        orientation: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientation: [2, 1, 0, 0, 1, 0, 0, 2]
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientation: [0, 0, 0, 1, 2, 2]
      }
    },
    b: {
      EDGES: {
        permutation: [8, 5, 2, 1, 9, 7, 6, 3, 4, 0, 10, 11],
        orientation: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
      },
      CORNERS: {
        permutation: [4, 1, 2, 0, 5, 3, 6, 7],
        orientation: [1, 0, 0, 2, 2, 1, 0, 0]
      },
      CENTERS: {
        permutation: [3, 0, 2, 5, 4, 1],
        orientation: [3, 3, 3, 3, 0, 3]
      }
    },
    d: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientation: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientation: [0, 0, 0, 0, 0, 1]
      }
    }
  }
};
cube3x3x3KPuzzle.moves["Uw"] = cube3x3x3KPuzzle.moves["u"];
cube3x3x3KPuzzle.moves["Lw"] = cube3x3x3KPuzzle.moves["l"];
cube3x3x3KPuzzle.moves["Fw"] = cube3x3x3KPuzzle.moves["f"];
cube3x3x3KPuzzle.moves["Rw"] = cube3x3x3KPuzzle.moves["r"];
cube3x3x3KPuzzle.moves["Bw"] = cube3x3x3KPuzzle.moves["b"];
cube3x3x3KPuzzle.moves["Dw"] = cube3x3x3KPuzzle.moves["d"];

// src/cubing/puzzles/implementations/3x3x3/index.ts
var cube3x3x3 = {
  id: "3x3x3",
  fullName: "3\xD73\xD73 Cube",
  inventedBy: ["Ern\u0151 Rubik"],
  inventionYear: 1974,
  def: async () => {
    return cube3x3x3KPuzzle;
  },
  svg: async () => {
    return (await import("./implementations/3x3x3/3x3x3.kpuzzle.svg.js")).default;
  },
  llSVG: async () => {
    return (await import("./implementations/3x3x3/3x3x3-ll.kpuzzle.svg.js")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("3x3x3");
  },
  appearance: (stickering) => cubeAppearance(cube3x3x3, stickering),
  stickerings: cubeStickerings
};

// src/cubing/puzzles/implementations/clock/index.ts
var clock = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988,
  def: async () => {
    return await import("./implementations/clock/clock.kpuzzle.js");
  },
  svg: async () => {
    return (await import("./implementations/clock/clock.kpuzzle.svg.js")).default;
  }
};

// src/cubing/puzzles/stickerings/fto-stickerings.ts
async function ftoStickering(puzzleLoader, stickering) {
  const def = await puzzleLoader.def();
  const puzzleStickering = new PuzzleStickering(def);
  const m = new StickeringManager(def);
  const experimentalFTO_FC = () => m.and([m.move("U"), m.not(m.or(m.moves(["F", "BL", "BR"])))]);
  const experimentalFTO_F2T = () => m.and([m.move("U"), m.not(m.move("F"))]);
  const experimentalFTO_SC = () => m.or([
    experimentalFTO_F2T(),
    m.and([m.move("F"), m.not(m.or(m.moves(["U", "BL", "BR"])))])
  ]);
  const experimentalFTO_L2C = () => m.not(m.or([
    m.and([m.move("U"), m.move("F")]),
    m.and([m.move("F"), m.move("BL")]),
    m.and([m.move("F"), m.move("BR")]),
    m.and([m.move("BL"), m.move("BR")])
  ]));
  const experimentalFTO_LBT = () => m.not(m.or([
    m.and([m.move("F"), m.move("BL")]),
    m.and([m.move("F"), m.move("BR")])
  ]));
  switch (stickering) {
    case "full":
      break;
    case "experimental-fto-fc":
      puzzleStickering.set(m.not(experimentalFTO_FC()), PieceStickering.Ignored);
      break;
    case "experimental-fto-f2t":
      puzzleStickering.set(m.not(experimentalFTO_F2T()), PieceStickering.Ignored);
      break;
    case "experimental-fto-sc":
      puzzleStickering.set(m.not(experimentalFTO_SC()), PieceStickering.Ignored);
      break;
    case "experimental-fto-l2c":
      puzzleStickering.set(m.not(experimentalFTO_L2C()), PieceStickering.Ignored);
      break;
    case "experimental-fto-lbt":
      puzzleStickering.set(m.not(experimentalFTO_LBT()), PieceStickering.Ignored);
      break;
    default:
      console.warn(`Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`);
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering.toAppearance();
}
async function ftoStickerings() {
  return [
    "full",
    "experimental-fto-fc",
    "experimental-fto-f2t",
    "experimental-fto-sc",
    "experimental-fto-l2c",
    "experimental-fto-lbt"
  ];
}

// src/cubing/puzzles/implementations/fto/index.ts
var fto = genericPGPuzzleLoader("FTO", "Face-Turning Octahedron", {
  inventedBy: ["Karl Rohrbach", "David Pitcher"],
  inventionYear: 1983
});
fto.appearance = (stickering) => ftoStickering(fto, stickering);
fto.stickerings = ftoStickerings;

// src/cubing/puzzles/stickerings/megaminx-stickerings.ts
async function megaminxAppearance(puzzleLoader, stickering) {
  switch (stickering) {
    case "full":
    case "F2L":
    case "LL":
      return cubeAppearance(puzzleLoader, stickering);
    default:
      console.warn(`Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`);
  }
  return cubeAppearance(puzzleLoader, "full");
}
async function megaminxStickerings() {
  return ["full", "F2L", "LL"];
}

// src/cubing/puzzles/implementations/megaminx/index.ts
var megaminx = genericPGPuzzleLoader("megaminx", "Megaminx", {
  inventionYear: 1981
});
megaminx.appearance = (stickering) => megaminxAppearance(megaminx, stickering);
megaminx.stickerings = megaminxStickerings;

// src/cubing/puzzles/implementations/pyraminx/index.ts
var pyraminx = {
  id: "pyraminx",
  fullName: "Pyraminx",
  inventedBy: ["Uwe Meffert"],
  inventionYear: 1970,
  def: async () => {
    return await import("./implementations/pyraminx/pyraminx.kpuzzle.js");
  },
  svg: async () => {
    return (await import("./implementations/pyraminx/pyraminx.kpuzzle.svg.js")).default;
  }
};

// src/cubing/puzzles/implementations/square1/index.ts
var square1 = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hr\u0161el", "Vojtech Kopsk\xFD"],
  inventionYear: 1990,
  def: async () => {
    return await import("./implementations/square1/sq1-hyperorbit.kpuzzle.js");
  },
  svg: async () => {
    return (await import("./implementations/square1/sq1-hyperorbit.kpuzzle.svg.js")).default;
  }
};

// src/cubing/puzzles/index.ts
var puzzles = {
  "3x3x3": cube3x3x3,
  "2x2x2": cube2x2x2,
  "4x4x4": cubePGPuzzleLoader("4x4x4", "4\xD74\xD74 Cube"),
  "5x5x5": cubePGPuzzleLoader("5x5x5", "5\xD75\xD75 Cube"),
  "6x6x6": cubePGPuzzleLoader("6x6x6", "6\xD76\xD76 Cube"),
  "7x7x7": cubePGPuzzleLoader("7x7x7", "7\xD77\xD77 Cube"),
  "40x40x40": cubePGPuzzleLoader("40x40x40", "40\xD740\xD740 Cube"),
  clock,
  megaminx,
  pyraminx,
  skewb: genericPGPuzzleLoader("skewb", "Skewb", {
    inventedBy: ["Tony Durham"]
  }),
  square1,
  fto,
  gigaminx: genericPGPuzzleLoader("gigaminx", "Gigaminx", {
    inventedBy: ["Tyler Fox"],
    inventionYear: 2006
  })
};
export {
  cube2x2x2,
  cube3x3x3,
  cube3x3x3KPuzzle as experimentalCube3x3x3KPuzzle,
  getFaceletAppearance as experimentalGetFaceletAppearance,
  puzzles
};
