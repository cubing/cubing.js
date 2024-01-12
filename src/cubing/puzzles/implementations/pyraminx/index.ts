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
  override svg = getCached(async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .pyraminxSVG;
  });
}

export const pyraminx = new PyraminxPuzzleLoader();
