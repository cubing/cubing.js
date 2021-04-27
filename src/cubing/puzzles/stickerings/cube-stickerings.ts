import type { ExperimentalStickering } from "../../twisty";
import type { PuzzleLoader } from "../PuzzleLoader";
import {
  PuzzleAppearance,
  PuzzleStickering,
  StickeringManager,
  PieceSet,
  PieceStickering,
} from "./appearance";

// TODO: cache calculations?
export async function cubeAppearance(
  puzzleLoader: PuzzleLoader,
  stickering: ExperimentalStickering,
): Promise<PuzzleAppearance> {
  const def = await puzzleLoader.def();
  const puzzleStickering = new PuzzleStickering(def);
  const m = new StickeringManager(def);

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
    case "CLL":
      dimF2L();
      puzzleStickering.set(
        m.not(m.and([CORNERS(), LL()])),
        PieceStickering.Dim,
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

export async function cubeStickerings(): Promise<ExperimentalStickering[]> {
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
    "centers-only",
  ];
}
