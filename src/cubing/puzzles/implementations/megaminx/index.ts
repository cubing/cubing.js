import type { ExperimentalStickering } from "../../../twisty/index.ts";
import { PGPuzzleLoader } from "../../async/async-pg3d.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { StickeringMask } from "../../stickerings/mask.ts";
import {
  megaminxStickeringMask,
  megaminxStickerings,
} from "../../stickerings/megaminx-stickerings.ts";
import { megaminxKeyMapping } from "./megaminxKeyMapping.ts";

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

  llSVG = getCached(async () => {
    return (await import("../dynamic/megaminx/puzzles-dynamic-megaminx.ts"))
      .megaminxLLSVG;
  });

  keyMapping = async () => megaminxKeyMapping; // TODO: async loading
}

export const megaminx = new MegaminxPuzzleLoader();
