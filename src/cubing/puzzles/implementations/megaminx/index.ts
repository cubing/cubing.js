import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import type { PuzzleAppearance } from "../../stickerings/mask";
import {
  megaminxAppearance,
  megaminxStickerings,
} from "../../stickerings/megaminx-stickerings";

class MegaminxPuzzleLoader extends PGPuzzleLoader {
  constructor() {
    super({
      id: "megaminx",
      fullName: "Megaminx",
      // Too many simultaneous inventors to name.
      inventionYear: 1981, // Earliest date from https://www.jaapsch.net/puzzles/megaminx.htm
    });
  }
  appearance(stickering: ExperimentalStickering): Promise<PuzzleAppearance> {
    return megaminxAppearance(this, stickering);
  }
  stickerings = megaminxStickerings;
}

export const megaminx = new MegaminxPuzzleLoader();
