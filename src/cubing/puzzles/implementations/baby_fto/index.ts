import type { ExperimentalStickering } from "../../../twisty/index.ts";
import { PGPuzzleLoader } from "../../async/async-pg3d.ts";
import { getCached } from "../../async/lazy-cached.ts";
import { ftoStickering } from "../../stickerings/fto-stickerings.ts";
import type { StickeringMask } from "../../stickerings/mask.ts";
import { ftoKeyMapping } from "../fto/ftoKeyMapping.ts";

class BabyFTOPuzzleLoader extends PGPuzzleLoader {
  constructor() {
    super({
      pgID: "skewb diamond",
      id: "baby_fto",
      fullName: "Baby FTO",
      inventedBy: ["Uwe Mèffert"],
      // inventionYear: TODO
      setOrientationModTo1ForPiecesOfOrbits: ["CENTERS"],
    });
  }
  stickeringMask(stickering: ExperimentalStickering): Promise<StickeringMask> {
    return ftoStickering(this, stickering);
  }
  override svg = getCached(async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial.ts"))
      .babyFTOSVG;
  });
  keyMapping = async () => ftoKeyMapping;
}

export const baby_fto = new BabyFTOPuzzleLoader();
