// To run this file directly:
// bun run src/bin/scramble.ts -- <program args>

import { randomScrambleForEvent } from "../cubing/scramble";
import { setSearchDebug } from "../cubing/search";

const eventID = process.argv[2];

if (!eventID) {
  console.log(`Usage: scramble <event-id>

Example: scramble 333`);
  process.exit(0);
}

setSearchDebug({ logPerf: false }); // TODO: why doesn't this work?
console.log((await randomScrambleForEvent(eventID)).toString());
