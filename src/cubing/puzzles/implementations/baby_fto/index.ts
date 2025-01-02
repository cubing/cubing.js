import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
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
    });
  }
  stickeringMask(stickering: ExperimentalStickering): Promise<StickeringMask> {
    return ftoStickering(this, stickering);
  }
  keyMapping = async () => ftoKeyMapping;
}

export const baby_fto = new BabyFTOPuzzleLoader();
