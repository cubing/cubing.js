// import type { KPattern } from "./KPattern";

import type { KPattern } from "./KPattern";
import type { KPuzzleDefinitionJSON } from "./KPuzzleDefinitionJSON";

export interface KPuzzleDefinition extends KPuzzleDefinitionJSON {
  // Note: the options are intentionally required for now, since we haven't yet
  // figured out how to make sure there is no unexpected behaviour with the
  // defaults.
  experimentalIsPatternSolved?: (
    kpattern: KPattern,
    options: {
      ignorePuzzleOrientation: boolean;
      ignoreCenterOrientation: boolean;
    },
  ) => boolean;
}
