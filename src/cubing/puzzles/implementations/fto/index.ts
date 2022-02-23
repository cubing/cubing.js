import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleAppearance } from "../../stickerings/appearance";
import {
  ftoStickering,
  ftoStickerings,
} from "../../stickerings/fto-stickerings";

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
  appearance(stickering: ExperimentalStickering): Promise<PuzzleAppearance> {
    return ftoStickering(this, stickering);
  }
  stickerings = ftoStickerings;
  svg = getCached(async () => {
    return (await import("./fto.kpuzzle.svg")).ftoSVG;
  });
}

export const fto = new FTOPuzzleLoader();
