import { PGPuzzleLoader } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";

class PyraminxPuzzleLoader extends PGPuzzleLoader {
  constructor() {
    super({
      id: "pyraminx",
      fullName: "Pyraminx",
      inventedBy: ["Uwe Meffert"],
    });
  }
  svg = getCached(async () => {
    return (await import("./pyraminx.kpuzzle.svg")).default;
  });
}

export const pyraminx = new PyraminxPuzzleLoader();
