import { PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { AlgTransformData } from "../../cubing-private";

class PyraminxPuzzleLoader extends PGPuzzleLoader {
  constructor() {
    super({
      id: "pyraminx",
      fullName: "Pyraminx",
      inventedBy: ["Uwe Meffert"],
    });
  }
  override svg = getCached(async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .pyraminxSVG;
  });
  algTransformData: AlgTransformData = {
    "↔ Mirror (x)": {
      replaceMovesByFamily: {
        L: "R",
        R: "L",
        l: "r",
        r: "l",
        Lw: "Rw",
        Rw: "Lw",
        Lv: "Rv",
        Rv: "Lv",
      },
      invertExceptByFamily: new Set([]),
    },
  };
}

export const pyraminx = new PyraminxPuzzleLoader();
