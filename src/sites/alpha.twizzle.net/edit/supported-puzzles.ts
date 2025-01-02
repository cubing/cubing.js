import {
  getPuzzleGeometryByDesc,
  type StickerDat,
} from "../../../cubing/puzzle-geometry";
import { puzzles } from "../../../cubing/puzzles";
import type { PuzzleID, VisualizationFormat } from "../../../cubing/twisty";

class DisplayableKPuzzle {
  public type: "kpuzzle" = "kpuzzle" as const;
  // TODO: push display name into the KSolve defition.
  constructor(
    private kpuzzleName: string,
    public viz: VisualizationFormat,
  ) {}

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
  public type: "pg3d" = "pg3d" as const;
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
    return this.name;
  }

  // public async kpuzzleDefinition(): Promise<KPuzzleDefinition> {
  //   return puzzles[this.name].def();
  // }

  public stickerDat(): StickerDat {
    // TODO: Remove `as` cast.
    const pg = getPuzzleGeometryByDesc(this.desc, { orientCenters: true });
    return pg.get3d();
  }
}

export type DisplayablePuzzle = DisplayableKPuzzle | DisplayablePG3D;

enum OptGroup {
  WCACubes = "Cubes",
  WCAMore = "More WCA puzzles",
  Other = "Other puzzles",
}
enum GeometrySymbol {
  Square = "■",
  Diamond = "◆",
  Pentagon = "⬟",
  TriangleUp = "▲",
  TriangleDown = "▼",
  Circle = "●",
}

const puzzleData: Partial<
  Record<
    PuzzleID,
    { "2D"?: boolean; optgroup: OptGroup; symbol: GeometrySymbol }
  >
> = {
  "2x2x2": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  "3x3x3": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  "4x4x4": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  "5x5x5": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  "6x6x6": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  "7x7x7": { optgroup: OptGroup.WCACubes, symbol: GeometrySymbol.Square },
  // Note: the order is important! It matches the WCA website.
  clock: {
    "2D": true,
    optgroup: OptGroup.WCAMore,
    symbol: GeometrySymbol.Circle,
  },
  megaminx: { optgroup: OptGroup.WCAMore, symbol: GeometrySymbol.Pentagon },
  pyraminx: { optgroup: OptGroup.WCAMore, symbol: GeometrySymbol.TriangleUp },
  skewb: { optgroup: OptGroup.WCAMore, symbol: GeometrySymbol.Diamond },
  square1: {
    "2D": true,
    optgroup: OptGroup.WCAMore,
    symbol: GeometrySymbol.Diamond,
  },
  gigaminx: { optgroup: OptGroup.Other, symbol: GeometrySymbol.Pentagon },
  fto: { optgroup: OptGroup.Other, symbol: GeometrySymbol.TriangleDown },
  master_tetraminx: {
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.TriangleUp,
  },
  kilominx: {
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.Pentagon,
  },
  redi_cube: {
    "2D": true,
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.Square,
  },
  baby_fto: { optgroup: OptGroup.Other, symbol: GeometrySymbol.TriangleDown },
  melindas2x2x2x2: {
    "2D": true,
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.Square,
  },
  tri_quad: {
    "2D": true,
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.Square,
  },
  loopover: {
    "2D": true,
    optgroup: OptGroup.Other,
    symbol: GeometrySymbol.Square,
  },
};

const puzzleGroups: Record<string, { name: string; symbol: string }[]> = {};
const supportedPuzzles: { [s: string]: DisplayablePuzzle } = {};
for (const [puzzleName, puzzleInfo] of Object.entries(puzzleData)) {
  (puzzleGroups[puzzleInfo.optgroup] ||= []).push({
    name: puzzleName,
    symbol: puzzleInfo.symbol,
  });
  supportedPuzzles[puzzleName] = new DisplayableKPuzzle(
    puzzleName,
    puzzleInfo["2D"] ? "2D" : "3D",
  );
}

export { puzzleGroups, supportedPuzzles };
