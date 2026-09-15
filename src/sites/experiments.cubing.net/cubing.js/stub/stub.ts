// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { setSearchDebug } from "../../../../cubing/search";

setSearchDebug({ allowLegacyPatternsForWorkerInstantiation: false });

(await randomScrambleForEvent("333")).log();
