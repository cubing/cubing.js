import { randomScrambleForEvent } from "../../../../src/cubing/scramble/index.ts";
import { setSearchDebug } from "../../../../src/cubing/search/index.ts";

setSearchDebug({ allowNodeStyleWorkers: false });
(await randomScrambleForEvent("222")).log();
