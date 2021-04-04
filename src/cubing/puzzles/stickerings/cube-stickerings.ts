import { Move } from "../../alg";
import { experimentalIs } from "../../alg/is";
import { KPuzzleDefinition, transformationForMove } from "../../kpuzzle";
import { ExperimentalStickering } from "../../twisty";
import {
  OrbitAppearance,
  PieceAppearance,
  PuzzleAppearance,
} from "../../twisty/3D/puzzles/appearance"; // TODO
import { PuzzleLoader } from "../PuzzleLoader";

enum PieceStickering {
  Regular,
  Dim,
  Ignored,
  OrientationStickers,
  Invisible,
  Ignoriented,
  IgnoreNonPrimary,
  PermuteNonPrimary,
  OrientationWithoutPermutation,
}

class PieceAnnotation<T> {
  stickerings: Map<string, T[]> = new Map();
  constructor(def: KPuzzleDefinition, defaultValue: T) {
    for (const [orbitName, orbitDef] of Object.entries(def.orbits)) {
      this.stickerings.set(
        orbitName,
        new Array(orbitDef.numPieces).fill(defaultValue),
      );
    }
  }
}

// regular
const r: PieceAppearance = {
  facelets: ["regular", "regular", "regular", "regular"],
};

// ignored
const i: PieceAppearance = {
  facelets: ["ignored", "ignored", "ignored", "ignored"],
};

// oriented stickers
const o: PieceAppearance = {
  facelets: ["oriented", "oriented", "oriented", "oriented"],
};

// invisible
const invisible: PieceAppearance = {
  facelets: ["invisible", "invisible", "invisible", "invisible"], // TODO: 4th entry is for void cube. Should be handled properly for all stickerings.
};

// "OLL"
const riii: PieceAppearance = {
  facelets: ["regular", "ignored", "ignored", "ignored"],
};

// "PLL"
const drrr: PieceAppearance = {
  facelets: ["dim", "regular", "regular", "regular"],
};

// ignored
const d: PieceAppearance = {
  facelets: ["dim", "dim", "dim", "dim"],
};

// "OLL"
const diii: PieceAppearance = {
  facelets: ["dim", "ignored", "ignored", "ignored"],
};

// oriented
const oiii: PieceAppearance = {
  facelets: ["oriented", "ignored", "ignored", "ignored"],
};

function getPieceAppearance(pieceStickering: PieceStickering): PieceAppearance {
  switch (pieceStickering) {
    case PieceStickering.Regular:
      return r;
    case PieceStickering.Dim:
      return d;
    case PieceStickering.Ignored:
      return i;
    case PieceStickering.OrientationStickers: // TODO: Hack for centers. This shouldn't be needed.
      return o;
    case PieceStickering.Invisible: // TODO: Hack for centers. This shouldn't be needed.
      return invisible;
    case PieceStickering.IgnoreNonPrimary:
      return riii;
    case PieceStickering.PermuteNonPrimary:
      return drrr;
    case PieceStickering.Ignoriented:
      return diii;
    case PieceStickering.OrientationWithoutPermutation:
      return oiii;
  }
}

class PuzzleStickering extends PieceAnnotation<PieceStickering> {
  constructor(def: KPuzzleDefinition) {
    super(def, PieceStickering.Regular);
  }

  set(pieceSet: PieceSet, pieceStickering: PieceStickering): PuzzleStickering {
    for (const [orbitName, pieces] of this.stickerings.entries()) {
      for (let i = 0; i < pieces.length; i++) {
        if (pieceSet.stickerings.get(orbitName)![i]) {
          pieces[i] = pieceStickering;
        }
      }
    }
    return this;
  }

  toAppearance(): PuzzleAppearance {
    const appearance: PuzzleAppearance = { orbits: {} };
    for (const [orbitName, pieceStickerings] of this.stickerings.entries()) {
      const pieces: PieceAppearance[] = [];
      const orbitAppearance: OrbitAppearance = {
        pieces,
      };
      appearance.orbits[orbitName] = orbitAppearance;
      for (const pieceStickering of pieceStickerings) {
        pieces.push(getPieceAppearance(pieceStickering));
      }
    }
    return appearance;
  }
}

type PieceSet = PieceAnnotation<boolean>;

class StickeringManager {
  constructor(private def: KPuzzleDefinition) {}

  and(pieceSets: PieceSet[]): PieceSet {
    const newPieceSet = new PieceAnnotation<boolean>(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      pieceLoop: for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = true;
        for (const pieceSet of pieceSets) {
          if (!pieceSet.stickerings.get(orbitName)![i]) {
            newPieceSet.stickerings.get(orbitName)![i] = false;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }

  or(pieceSets: PieceSet[]): PieceSet {
    // TODO: unify impl with and?
    const newPieceSet = new PieceAnnotation<boolean>(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      pieceLoop: for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = false;
        for (const pieceSet of pieceSets) {
          if (pieceSet.stickerings.get(orbitName)![i]) {
            newPieceSet.stickerings.get(orbitName)![i] = true;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }

  not(pieceSet: PieceSet): PieceSet {
    const newPieceSet = new PieceAnnotation<boolean>(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      for (let i = 0; i < orbitDef.numPieces; i++) {
        newPieceSet.stickerings.get(orbitName)![i] = !pieceSet.stickerings.get(
          orbitName,
        )![i];
      }
    }
    return newPieceSet;
  }

  all(): PieceSet {
    return this.and(this.moves([])); // TODO: are the degenerate cases for and/or the wrong way around
  }

  move(moveSource: Move | string): PieceSet {
    const transformation = transformationForMove(
      this.def,
      experimentalIs(moveSource, Move)
        ? (moveSource as Move)
        : Move.fromString(moveSource as string),
    );
    const newPieceSet = new PieceAnnotation<boolean>(this.def, false);
    for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
      for (let i = 0; i < orbitDef.numPieces; i++) {
        if (
          transformation[orbitName].permutation[i] !== i ||
          transformation[orbitName].orientation[i] !== 0
        ) {
          newPieceSet.stickerings.get(orbitName)![i] = true;
        }
      }
    }
    return newPieceSet;
  }

  moves(moveSources: (Move | string)[]): PieceSet[] {
    return moveSources.map((moveSource) => this.move(moveSource));
  }

  // orbits(orbitNames: string[]): PieceSet {
  //   const pieceSet = new PieceAnnotation<boolean>(this.def, false);
  //   for (const orbitName of orbitNames) {
  //     pieceSet.stickerings.get(orbitName)!.fill(true);
  //   }
  //   return pieceSet;
  // }

  // trueCounts(pieceSet: PieceSet): Record<string, number> {
  //   const counts: Record<string, number> = {};
  //   for (const [orbitName, orbitDef] of Object.entries(this.def.orbits)) {
  //     let count = 0;
  //     for (let i = 0; i < orbitDef.numPieces; i++) {
  //       if (pieceSet.stickerings.get(orbitName)![i]) {
  //         count++;
  //       }
  //     }
  //     counts[orbitName] = count;
  //   }
  //   return counts;
  // }
}

// TODO: cache calculations?
export async function cubeStickering(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<PuzzleAppearance> {
  const def = await puzzleLoader.def();
  const puzzleStickering = new PuzzleStickering(def);
  const m = new StickeringManager(def);
  console.log(stickering);

  const LL = (): PieceSet => m.move("U");
  const orUD = (): PieceSet => m.or(m.moves(["U", "D"]));
  const E = (): PieceSet => m.not(orUD());
  const orLR = (): PieceSet => m.or(m.moves(["L", "R"]));
  const M = (): PieceSet => m.not(orLR());
  const orFB = (): PieceSet => m.or(m.moves(["F", "B"]));
  const S = (): PieceSet => m.not(orFB());

  const F2L = (): PieceSet => m.not(LL());

  const centerU = (): PieceSet => m.and([LL(), M(), S()]);

  const edgeFR = (): PieceSet =>
    m.and([m.and(m.moves(["F", "R"])), m.not(orUD())]);
  const cornerDFR = (): PieceSet => m.and(m.moves(["D", "R", "F"]));
  const slotFR = (): PieceSet => m.or([cornerDFR(), edgeFR()]);

  const CENTERS = (): PieceSet =>
    m.or([m.and([M(), E()]), m.and([M(), S()]), m.and([E(), S()])]);
  const EDGES = (): PieceSet =>
    m.or([
      m.and([M(), orUD(), orFB()]),
      m.and([E(), orLR(), orFB()]),
      m.and([S(), orUD(), orLR()]),
    ]);
  const CORNERS = (): PieceSet => m.not(m.or([CENTERS(), EDGES()]));
  const L6E = (): PieceSet => m.or([M(), m.and([LL(), EDGES()])]);

  function dimF2L(): void {
    puzzleStickering.set(F2L(), PieceStickering.Dim);
  }

  function setPLL(): void {
    puzzleStickering.set(LL(), PieceStickering.PermuteNonPrimary);
    puzzleStickering.set(centerU(), PieceStickering.Dim); // TODO: why is this needed?
  }

  function setOLL(): void {
    puzzleStickering.set(LL(), PieceStickering.IgnoreNonPrimary);
    puzzleStickering.set(centerU(), PieceStickering.Regular); // TODO: why is this needed?
  }

  function dimOLL(): void {
    puzzleStickering.set(LL(), PieceStickering.Ignoriented);
    puzzleStickering.set(centerU(), PieceStickering.Dim); // TODO: why is this needed?
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
      puzzleStickering.set(
        m.and(m.moves(["D", "R", "F"])),
        PieceStickering.Regular,
      );
      puzzleStickering.set(LL(), PieceStickering.Ignoriented);
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
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
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
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
      puzzleStickering.set(centerU(), PieceStickering.Dim); // why is this needed?
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    case "ZBLS":
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      break;
    case "WVLS":
    // fallthrough
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
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation,
      );
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
      puzzleStickering.set(
        L6E(),
        PieceStickering.OrientationWithoutPermutation,
      );
      puzzleStickering.set(
        m.and([CENTERS(), orUD()]),
        PieceStickering.OrientationStickers,
      ); // TODO: why is this needed?
      break;
    case "Daisy":
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([m.move("D"), CENTERS()]),
        PieceStickering.Regular,
      );
      puzzleStickering.set(
        m.and([m.move("U"), EDGES()]),
        PieceStickering.IgnoreNonPrimary,
      );
      break;
    case "Cross":
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([m.move("D"), CENTERS()]),
        PieceStickering.Regular,
      );
      puzzleStickering.set(
        m.and([m.move("D"), EDGES()]),
        PieceStickering.Regular,
      );
      break;
    case "2x2x2":
      puzzleStickering.set(
        m.or(m.moves(["U", "F", "R"])),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(
        m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]),
        PieceStickering.Dim,
      );
      break;
    case "2x2x3":
      puzzleStickering.set(m.all(), PieceStickering.Dim);
      puzzleStickering.set(
        m.or(m.moves(["U", "F", "R"])),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(
        m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]),
        PieceStickering.Dim,
      );
      puzzleStickering.set(
        m.and([m.move("F"), m.not(m.or(m.moves(["U", "R"])))]),
        PieceStickering.Regular,
      );
      break;
    case "Void Cube":
      puzzleStickering.set(CENTERS(), PieceStickering.Invisible);
      break;
    case "picture":
    // fallthrough
    case "invisible":
      puzzleStickering.set(m.all(), PieceStickering.Invisible);
      break;
    case "centers-only":
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`,
      );
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering.toAppearance();
}

// (async () => {
//   // const def = await puzzles["fto"].def();
//   // console.log(def);
//   const geometry = getPuzzleGeometryByName("FTO", [
//     "allmoves",
//     "true",
//     "orientcenters",
//     "true",
//     "rotations",
//     "true",
//   ]);
//   const def = geometry.writekpuzzle(true);
//   console.log(def);

//   const m = new StickeringManager(def);
//   // manager.
//   console.log(m);

//   const experimentalFTO_FC: PieceSet = m.and([
//     m.move("U"),
//     m.not(m.or(m.moves(["F", "BL", "BR"]))),
//   ]);
//   const experimentalFTO_F2T: PieceSet = m.and([
//     m.move("U"),
//     m.not(m.move("F")),
//   ]);
//   const experimentalFTO_SC: PieceSet = m.or([
//     experimentalFTO_F2T,
//     m.and([m.move("F"), m.not(m.or(m.moves(["U", "BL", "BR"])))]),
//   ]);
//   const experimentalFTO_L2C: PieceSet = m.not(
//     m.or([
//       m.and([m.move("U"), m.move("F")]),
//       m.and([m.move("F"), m.move("BL")]),
//       m.and([m.move("F"), m.move("BR")]),
//       m.and([m.move("BL"), m.move("BR")]),
//     ]),
//   );
//   const experimentalFTO_LBT: PieceSet = m.not(
//     m.or([
//       m.and([m.move("F"), m.move("BL")]),
//       m.and([m.move("F"), m.move("BR")]),
//     ]),
//   );

//   const puzzleStickerings = JSON.stringify(
//     {
//       "full": new PuzzleStickering(def).toAppearance(),
//       "experimental-fto-fc": new PuzzleStickering(def)
//         .set(m.not(experimentalFTO_FC), PieceStickering.Ignored)
//         .toAppearance(),
//       "experimental-fto-f2t": new PuzzleStickering(def)
//         .set(m.not(experimentalFTO_F2T), PieceStickering.Ignored)
//         .toAppearance(),
//       "experimental-fto-sc": new PuzzleStickering(def)
//         .set(m.not(experimentalFTO_SC), PieceStickering.Ignored)
//         .toAppearance(),
//       "experimental-fto-l2c": new PuzzleStickering(def)
//         .set(m.not(experimentalFTO_L2C), PieceStickering.Ignored)
//         .toAppearance(),
//       "experimental-fto-lbt": new PuzzleStickering(def)
//         .set(m.not(experimentalFTO_LBT), PieceStickering.Ignored)
//         .toAppearance(),
//     },
//     null,
//     "  ",
//   );
//   console.log(puzzleStickerings);

//   console.log(m.trueCounts(experimentalFTO_FC));
//   console.log(m.trueCounts(experimentalFTO_F2T));
//   console.log(m.trueCounts(experimentalFTO_SC));
//   console.log(m.trueCounts(experimentalFTO_L2C));
//   console.log(m.trueCounts(experimentalFTO_LBT));

//   // const puzzleStickering = new PieceAnnotation<PieceStickering>(
//   //   def,
//   //   PieceStickering.Regular,
//   // );
//   // console.log(puzzleStickering);
// })();
