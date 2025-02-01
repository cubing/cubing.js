import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { ftoStickering } from "../../stickerings/fto-stickerings";
import type { StickeringMask } from "../../stickerings/mask";
import { ftoKeyMapping } from "../fto/ftoKeyMapping";

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
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
      .babyFTOSVG;
  });
  keyMapping = async () => ftoKeyMapping;
}

export const baby_fto = new BabyFTOPuzzleLoader();
