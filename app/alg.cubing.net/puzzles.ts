import { KPuzzle, KPuzzleDefinition, Puzzles as KPuzzles } from "../../src/kpuzzle";
import { getPuzzleGeometryByDesc, StickerDat } from "../../src/puzzle-geometry";
import { PuzzleName, Puzzles as PGPuzzles } from "../../src/puzzle-geometry/Puzzles";

class DisplayableKPuzzle {
  public type: "kpuzzle" = "kpuzzle";
  // TODO: push display name into the KSolve defition.
  constructor(private kpuzzleName: string) { }

  public displayName(): string {
    return KPuzzles[this.kpuzzleName].name;
  }

  public puzzleName(): string {
    return this.kpuzzleName;
  }

  public kpuzzleDefinition(): KPuzzleDefinition {
    return KPuzzles[this.kpuzzleName];
  }
}

class DisplayablePG3D {
  public type: "pg3d" = "pg3d";
  constructor(private displayNameStr: string, private name: PuzzleName, private desc: string, public polarVantages: boolean) { }

  public displayName(): string {
    return this.displayNameStr;
  }

  public puzzleName(): string {
    return this.name as string;
  }

  public kpuzzleDefinition(): KPuzzleDefinition {
    const pg = getPuzzleGeometryByDesc(this.desc, ["orientcenters", "true"]);
    const kpuzzleDef = pg.writekpuzzle();
    const worker = new KPuzzle(kpuzzleDef);

    // Wide move / rotation hack
    worker.setFaceNames(pg.facenames.map((_: any) => _[1]));
    const mps = pg.movesetgeos;
    for (const mp of mps) {
      const grip1 = mp[0] as string;
      const grip2 = mp[2] as string;
      // angle compatibility hack
      worker.addGrip(grip1, grip2, mp[4] as number);
    }
    return kpuzzleDef;
  }

  public stickerDat(): StickerDat {
    // TODO: Remove `as` cast.
    const pg = getPuzzleGeometryByDesc(this.desc, ["orientcenters", "true"]);
    return pg.get3d(0.0131);
  }
}

export type DisplayablePuzzle = DisplayableKPuzzle | DisplayablePG3D;

const puzzles: { [s: string]: DisplayablePuzzle } = {};
for (const key in KPuzzles) {
  puzzles[key as any] = new DisplayableKPuzzle(key);
}
puzzles.megaminx = new DisplayablePG3D("Megaminx", "megaminx", PGPuzzles.megaminx, false);
puzzles.skewb = new DisplayablePG3D("Skewb", "skewb", PGPuzzles.skewb, false);
puzzles.fto = new DisplayablePG3D("FTO", "FTO", "o f 0.333333333333333 v -2", true);

export { puzzles };
