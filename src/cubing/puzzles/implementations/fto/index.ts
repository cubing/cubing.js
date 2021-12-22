import type { PuzzleLoader } from "../..";
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import type { PuzzleAppearance } from "../../stickerings/appearance";
import {
  ftoStickering,
  ftoStickerings,
} from "../../stickerings/fto-stickerings";

export const fto: PuzzleLoader = {
  id: "fto",
  fullName: "Face-Turning Octahedron",
  inventedBy: ["Karl Rohrbach", "David Pitcher"], // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
  inventionYear: 1983, // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
  def: async () => {
    return asyncGetDef("FTO");
  },
  svg: async () => {
    const pg = await asyncGetPuzzleGeometry("FTO");
    return pg.generatesvg();
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("FTO");
  },
  appearance: (stickering: ExperimentalStickering): Promise<PuzzleAppearance> =>
    ftoStickering(fto, stickering),
  stickerings: ftoStickerings,
};
