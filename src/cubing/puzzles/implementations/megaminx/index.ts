import type { ExperimentalStickering } from "../../../twisty";
import { PGPuzzleLoader } from "../../async/async-pg3d";
import type { PuzzleAppearance } from "../../stickerings/appearance";
import {
  megaminxAppearance,
  megaminxStickerings,
} from "../../stickerings/megaminx-stickerings";

const megaminx = new PGPuzzleLoader({
  id: "megaminx",
  fullName: "Megaminx",
  // Too many simultaneous inventors to name.
  inventionYear: 1981, // Earliest date from https://www.jaapsch.net/puzzles/megaminx.htm
});

// TODO: loading the stickering code async.
megaminx.appearance = (
  stickering: ExperimentalStickering,
): Promise<PuzzleAppearance> => megaminxAppearance(megaminx, stickering);
megaminx.stickerings = megaminxStickerings;

export { megaminx };
