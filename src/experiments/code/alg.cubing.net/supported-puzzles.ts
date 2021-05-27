import {
  getPuzzleGeometryByDesc,
  StickerDat,
} from "../../../cubing/puzzle-geometry";
import { puzzles } from "../../../cubing/puzzles";
import type { VisualizationFormat } from "../../../cubing/twisty/dom/TwistyPlayerConfig";

class DisplayableKPuzzle {
  public type: "kpuzzle" = "kpuzzle";
  // TODO: push display name into the KSolve defition.
  constructor(private kpuzzleName: string, public viz: VisualizationFormat) {}

  public displayName(): string {
    return puzzles[this.kpuzzleName].fullName;
  }

  public puzzleName(): string {
    return this.kpuzzleName;
  }

  // public async kpuzzleDefinition(): Promise<KPuzzleDefinition> {
  //   return await puzzles[this.kpuzzleName].def();
  // }
}

class DisplayablePG3D {
  public type: "pg3d" = "pg3d";
  public viz: VisualizationFormat = "PG3D";
  constructor(
    private displayNameStr: string,
    private name: string,
    private desc: string,
    public polarVantages: boolean,
  ) {}

  public displayName(): string {
    return this.displayNameStr;
  }

  public puzzleName(): string {
    return this.name as string;
  }

  // public async kpuzzleDefinition(): Promise<KPuzzleDefinition> {
  //   return puzzles[this.name].def();
  // }

  public stickerDat(): StickerDat {
    // TODO: Remove `as` cast.
    const pg = getPuzzleGeometryByDesc(this.desc, ["orientcenters", "true"]);
    return pg.get3d();
  }
}

export type DisplayablePuzzle = DisplayableKPuzzle | DisplayablePG3D;

const supportedPuzzles: { [s: string]: DisplayablePuzzle } = {};
for (const key of [
  "2x2x2",
  "3x3x3",
  "4x4x4",
  "5x5x5",
  "6x6x6",
  "7x7x7",
  "pyraminx",
  "square1",
  "clock",
  "megaminx",
  "gigaminx",
  "skewb",
  "fto",
]) {
  supportedPuzzles[key as any] = new DisplayableKPuzzle(
    key,
    [
      "2x2x2",
      "3x3x3",
      "4x4x4",
      "5x5x5",
      "6x6x6",
      "7x7x7",
      "megaminx",
      "skewb",
      "fto",
      "gigaminx",
      "pyraminx",
    ].includes(key)
      ? "3D"
      : "2D",
  );
}
// supportedPuzzle.megaminx = new DisplayablePG3D(
//   "Megaminx",
//   "megaminx",
//   puzzles.megaminx,
//   false,
// );
// supportedPuzzle.skewb = new DisplayablePG3D(
//   "Skewb",
//   "skewb",
//   PGPuzzles.skewb,
//   false,
// );
// supportedPuzzle.fto = new DisplayablePG3D(
//   "FTO",
//   "FTO",
//   "o f 0.333333333333333 v -2",
//   true,
// );

export { supportedPuzzles };
