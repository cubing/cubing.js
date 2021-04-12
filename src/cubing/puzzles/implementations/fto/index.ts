import type { ExperimentalStickering } from "../../../twisty";
import { genericPGPuzzleLoader } from "../../async/async-pg3d";
import { PuzzleAppearance } from "../../stickerings/appearance";
import {
  ftoStickering,
  ftoStickerings,
} from "../../stickerings/fto-stickerings";

const fto = genericPGPuzzleLoader("FTO", "Face-Turning Octahedron", {
  inventedBy: ["Karl Rohrbach", "David Pitcher"], // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
  inventionYear: 1983, // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
});

// TODO: loading the stickering code async.
fto.appearance = (
  stickering: ExperimentalStickering,
): Promise<PuzzleAppearance> => ftoStickering(fto, stickering);
fto.stickerings = ftoStickerings;

export { fto };
