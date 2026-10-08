import type { ExperimentalStickering } from "../../../twisty/index.ts";
import { PGPuzzleLoader } from "../../async/async-pg3d.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { AlgTransformData } from "../../cubing-private/index.ts";
import {
  ftoStickering,
  ftoStickerings,
} from "../../stickerings/fto-stickerings.ts";
import type { StickeringMask } from "../../stickerings/mask.ts";
import { ftoKeyMapping } from "./ftoKeyMapping.ts";

class FTOPuzzleLoader extends PGPuzzleLoader {
  constructor() {
    super({
      pgID: "FTO",
      id: "fto",
      fullName: "Face-Turning Octahedron",
      inventedBy: ["Karl Rohrbach", "David Pitcher"], // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
      inventionYear: 1983, // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
    });
  }
  stickeringMask(stickering: ExperimentalStickering): Promise<StickeringMask> {
    return ftoStickering(this, stickering);
  }
  stickerings = ftoStickerings;
  override svg = getCached(async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial.ts"))
      .ftoSVG;
  });
  keyMapping = async () => ftoKeyMapping;
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
        BL: "BR",
        BR: "BL",
        bl: "br",
        br: "bl",
        BLw: "BRw",
        BRw: "BLw",
        BLv: "BRv",
        BRv: "BLv",
      },
      invertExceptByFamily: new Set(["x"]),
    },
  };
}

export const fto = new FTOPuzzleLoader();
