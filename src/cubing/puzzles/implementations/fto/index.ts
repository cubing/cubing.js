import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import {
  ftoStickering,
  ftoStickerings,
} from "../../stickerings/fto-stickerings";
import type { StickeringMask } from "../../stickerings/mask";
import { ftoKeyMapping } from "./ftoKeyMapping";

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
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
      .ftoSVG;
  });
  keyMapping = async () => ftoKeyMapping;
}

export const fto = new FTOPuzzleLoader();
