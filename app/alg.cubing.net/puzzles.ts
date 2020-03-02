import { KPuzzle, KPuzzleDefinition, Puzzles } from "../../src/kpuzzle";
import { getPuzzleGeometryByName, StickerDat } from "../../src/puzzle-geometry";
import { PuzzleName } from "../../src/puzzle-geometry/Puzzles";

class DisplayableKPuzzle {
  public type: "kpuzzle" = "kpuzzle";
  // TODO: push display name into the KSolve defition.
  constructor(private displayNameStr: string, private kpuzzleName: string) { }

  public displayName(): string {
    return this.displayNameStr;
  }

  public puzzleName(): string {
    return this.kpuzzleName;
  }

  public kpuzzleDefinition(): KPuzzleDefinition {
    return Puzzles[this.kpuzzleName];
  }
}

class DisplayablePG3D {
  public type: "pg3d" = "pg3d";
  constructor(private displayNameStr: string, private pg3dName: PuzzleName) { }

  public displayName(): string {
    return this.displayNameStr;
  }

  public puzzleName(): string {
    return this.pg3dName as string;
  }

  public kpuzzleDefinition(): KPuzzleDefinition {
    const pg = getPuzzleGeometryByName(this.pg3dName as any, ["orientcenters", "true"]);
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
    const pg = getPuzzleGeometryByName(this.pg3dName as any, ["orientcenters", "true"]);
    return pg.get3d(0.0131);
  }
}

export type DisplayablePuzzle = DisplayableKPuzzle | DisplayablePG3D;

const puzzles: { [s: string]: DisplayablePuzzle } = {};
const displayNames: { [s: string]: string } = {
  sq1: "Square-1",
  pyram: "Pyraminx",
};
for (const key in Puzzles) {
  puzzles[key as any] = new DisplayableKPuzzle(displayNames[key] ?? key, key);
}
puzzles.megaminx = new DisplayablePG3D("Megaminx", "megaminx");

export { puzzles };
