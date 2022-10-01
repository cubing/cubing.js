import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import type { StickeringMask } from "../../stickerings/mask";
import {
  megaminxStickeringMask,
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
  stickeringMask(stickering: ExperimentalStickering): Promise<StickeringMask> {
    return megaminxStickeringMask(this, stickering);
  }
  stickerings = megaminxStickerings;
}

export const megaminx = new MegaminxPuzzleLoader();
