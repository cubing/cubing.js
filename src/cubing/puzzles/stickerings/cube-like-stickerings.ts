import type { ExperimentalStickering, PuzzleID } from "../../twisty";
import type { PuzzleLoader } from "../PuzzleLoader";
import {
  type PieceSet,
  PieceStickering,
  PuzzleStickering,
  StickeringManager,
  type StickeringMask,
} from "./mask";
import { experimentalStickerings } from "./puzzle-stickerings";

export async function cubeLikeStickeringMask(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<StickeringMask> {
  return (
    await cubeLikePuzzleStickering(puzzleLoader, stickering)
  ).toStickeringMask();
}

// TODO: cache calculations?
export async function cubeLikePuzzleStickering(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<PuzzleStickering> {
  const kpuzzle = await puzzleLoader.kpuzzle();
  const puzzleStickering = new PuzzleStickering(kpuzzle);
  const m = new StickeringManager(kpuzzle);

  const LL = (): PieceSet => m.move("U");
  const orUD = (): PieceSet => m.or(m.moves(["U", "D"]));
  const orLR = (): PieceSet => m.or(m.moves(["L", "R"]));
  const M = (): PieceSet => m.not(orLR());

  const F2L = (): PieceSet => m.not(LL());

  const CENTERS = (): PieceSet => m.orbitPrefix("CENTER");
  const CENTER = (faceMove: string): PieceSet =>
    m.and([m.move(faceMove), CENTERS()]);
  const EDGES = (): PieceSet => m.orbitPrefix("EDGE");
  const EDGE = (faceMoves: string[]): PieceSet =>
    m.and([m.and(m.moves(faceMoves)), EDGES()]);
  const CORNERS = (): PieceSet =>
    m.or([
      m.orbitPrefix("CORNER"),
      m.orbitPrefix("C4RNER"),
      m.orbitPrefix("C5RNER"),
    ]);

  const L6E = (): PieceSet => m.or([M(), m.and([LL(), EDGES()])]);
  const centerLL = (): PieceSet => m.and([LL(), CENTERS()]);

  const edgeFR = (): PieceSet => m.and([m.and(m.moves(["F", "R"])), EDGES()]);
  // Handles Megaminx
  const cornerDFR = (): PieceSet =>
    m.and([m.and(m.moves(["F", "R"])), CORNERS(), m.not(LL())]);
  const slotFR = (): PieceSet => m.or([cornerDFR(), edgeFR()]);

  function dimF2L(): void {
    puzzleStickering.set(F2L(), PieceStickering.Dim);
  }

  function setPLL(): void {
    puzzleStickering.set(LL(), PieceStickering.PermuteNonPrimary);
    puzzleStickering.set(centerLL(), PieceStickering.Dim); // For PG
  }

  function setOLL(): void {
    puzzleStickering.set(LL(), PieceStickering.IgnoreNonPrimary);
    puzzleStickering.set(centerLL(), PieceStickering.Regular); // For PG
  }

  function dimOLL(): void {
    puzzleStickering.set(LL(), PieceStickering.Ignoriented);
    puzzleStickering.set(centerLL(), PieceStickering.Dim); // For PG
  }

  switch (stickering) {
    case "full":
      break;
    case "PLL": {
      dimF2L();
      setPLL();
      break;
    }
    case "CLS": {
      dimF2L();
      puzzleStickering.set(cornerDFR(), PieceStickering.Regular);
      puzzleStickering.set(LL(), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
      break;
    }
    case "OLL": {
      dimF2L();
      setOLL();
      break;
    }
    case "EOLL": {
      dimF2L();
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      break;
    }
    case "COLL": {
      dimF2L();
      puzzleStickering.set(m.and([LL(), EDGES()]), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "OCLL": {
      dimF2L();
      dimOLL();
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
      break;
    }
    case "CPLL": {
      dimF2L();
      puzzleStickering.set(
        m.and([CORNERS(), LL()]),
        PieceStickering.PermuteNonPrimary,
      );
      puzzleStickering.set(
        m.and([m.not(CORNERS()), LL()]),
        PieceStickering.Dim,
      );
      break;
    }
    case "CLL": {
      dimF2L();
      puzzleStickering.set(
        m.not(m.and([CORNERS(), LL()])),
        PieceStickering.Dim,
      );
      break;
    }
    case "EPLL": {
      dimF2L();
      puzzleStickering.set(LL(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL(), EDGES()]),
        PieceStickering.PermuteNonPrimary,
      );
      break;
    }
    case "ELL": {
      dimF2L();
      puzzleStickering.set(LL(), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL(), EDGES()]), PieceStickering.Regular);
      break;
    }
    case "ELS": {
      dimF2L();
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      puzzleStickering.set(edgeFR(), PieceStickering.Regular);
      puzzleStickering.set(cornerDFR(), PieceStickering.Ignored);
      break;
    }
    case "LL": {
      dimF2L();
      break;
    }
    case "F2L": {
      puzzleStickering.set(LL(), PieceStickering.Ignored);
      break;
    }
    case "ZBLL": {
      dimF2L();
      puzzleStickering.set(LL(), PieceStickering.PermuteNonPrimary);
      puzzleStickering.set(centerLL(), PieceStickering.Dim); // For PG
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "ZBLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Ignored);
      break;
    }
    case "VLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      break;
    }
    case "WVLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      puzzleStickering.set(m.and([LL(), EDGES()]), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
      break;
    }
    case "LS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      puzzleStickering.set(LL(), PieceStickering.Ignored);
      puzzleStickering.set(centerLL(), PieceStickering.Dim);
      break;
    }
    case "LSOLL": {
      dimF2L();
      setOLL();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      break;
    }
    case "LSOCLL": {
      dimF2L();
      dimOLL();
      puzzleStickering.set(
        m.and([LL(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary,
      );
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      break;
    }
    case "EO": {
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation,
      );
      break;
    }
    case "EOline": {
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation,
      );
      puzzleStickering.set(m.and(m.moves(["D", "M"])), PieceStickering.Regular);
      break;
    }
    case "EOcross": {
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation,
      );
      puzzleStickering.set(m.move("D"), PieceStickering.Regular);
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      break;
    }
    case "CMLL": {
      puzzleStickering.set(F2L(), PieceStickering.Dim);
      puzzleStickering.set(L6E(), PieceStickering.Ignored);
      puzzleStickering.set(m.and([LL(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "L10P": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      puzzleStickering.set(m.and([CORNERS(), LL()]), PieceStickering.Regular);
      break;
    }
    case "L6E": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      break;
    }
    case "L6EO": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      puzzleStickering.set(
        L6E(),
        PieceStickering.ExperimentalOrientationWithoutPermutation2,
      );
      puzzleStickering.set(
        m.and([CENTERS(), orUD()]),
        PieceStickering.ExperimentalOrientationWithoutPermutation2,
      ); // For PG
      puzzleStickering.set(
        m.and([m.move("M"), m.move("E")]),
        PieceStickering.Ignored,
      );
      break;
    }
    case "Daisy": {
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
    }
    case "Cross": {
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
    }
    case "2x2x2": {
      puzzleStickering.set(
        m.or(m.moves(["U", "F", "R"])),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(
        m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]),
        PieceStickering.Dim,
      );
      break;
    }
    case "2x2x3": {
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
    }
    case "G1": {
      puzzleStickering.set(
        m.all(),
        PieceStickering.ExperimentalOrientationWithoutPermutation2,
      );
      puzzleStickering.set(
        m.or(m.moves(["E"])),
        PieceStickering.OrientationWithoutPermutation,
      );
      puzzleStickering.set(m.and(m.moves(["E", "S"])), PieceStickering.Ignored);
      break;
    }
    case "L2C": {
      puzzleStickering.set(
        m.or(m.moves(["L", "R", "B", "D"])),
        PieceStickering.Dim,
      );
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    }
    case "PBL": {
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(
        m.or(m.moves(["U", "D"])),
        PieceStickering.PermuteNonPrimary,
      );
      break;
    }
    case "FirstBlock": {
      puzzleStickering.set(
        m.not(m.and([m.and(m.moves(["L"])), m.not(LL())])),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(CENTER("R"), PieceStickering.Dim);
      break;
    }
    case "SecondBlock": {
      puzzleStickering.set(
        m.not(m.and([m.and(m.moves(["L"])), m.not(LL())])),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(
        m.and([m.and(m.moves(["L"])), m.not(LL())]),
        PieceStickering.Dim,
      );
      puzzleStickering.set(
        m.and([m.and(m.moves(["R"])), m.not(LL())]),
        PieceStickering.Regular,
      );
      break;
    }
    case "EODF": {
      dimF2L();
      puzzleStickering.set(
        m.or([cornerDFR(), m.and([LL(), CORNERS()])]),
        PieceStickering.Ignored,
      );
      puzzleStickering.set(
        m.or([m.and([LL(), EDGES()]), edgeFR()]),
        PieceStickering.OrientationWithoutPermutation,
      );
      puzzleStickering.set(EDGE(["D", "F"]), PieceStickering.Regular);
      puzzleStickering.set(CENTER("F"), PieceStickering.Regular);
      break;
    }
    case "Void Cube": {
      puzzleStickering.set(CENTERS(), PieceStickering.Invisible);
      break;
    }
    case "picture":
    // fallthrough
    case "invisible": {
      puzzleStickering.set(m.all(), PieceStickering.Invisible);
      break;
    }
    case "centers-only": {
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    }
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`,
      );
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering;
}

export async function cubeLikeStickeringList(
  puzzleID: PuzzleID,
  options?: { use3x3x3Fallbacks: boolean },
): Promise<ExperimentalStickering[]> {
  const stickerings: ExperimentalStickering[] = [];
  const stickeringsFallback: ExperimentalStickering[] = [];
  for (const [name, info] of Object.entries(experimentalStickerings)) {
    if (info.groups) {
      if (puzzleID in info.groups) {
        stickerings.push(name);
      } else if (options?.use3x3x3Fallbacks && "3x3x3" in info.groups) {
        stickeringsFallback.push(name);
      }
    }
  }
  return stickerings.concat(stickeringsFallback);
}
