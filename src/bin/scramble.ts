// To run this file directly:
// bun run src/bin/scramble.ts -- <program args>

import { randomScrambleForEvent } from "../cubing/scramble";
import { setSearchDebug } from "../cubing/search";
import { searchOutsideDebugGlobals } from "../cubing/search/outside";

const eventID = process.argv[2];

if (!eventID) {
  console.log("Usage: scramble <event-id>");
  console.log("");
  console.log("Example: scramble 333");
  process.exit(0);
}

setSearchDebug({ logPerf: false });
console.log(searchOutsideDebugGlobals);
console.log((await randomScrambleForEvent(eventID)).toString());
