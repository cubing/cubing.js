import * as alg from "./alg";
import * as bluetooth from "./bluetooth";
import * as kpuzzle from "./kpuzzle";
import * as notation from "./notation";
import * as protocol from "./protocol";
import * as puzzleGeometry from "./puzzle-geometry";
import * as puzzles from "./puzzles";
import * as scramble from "./scramble";
import * as stream from "./stream";
import * as search from "./search";
import * as twisty from "./twisty";

const cubing = {
  alg,
  bluetooth,
  kpuzzle,
  notation,
  protocol,
  puzzleGeometry,
  puzzles,
  scramble,
  stream,
  search,
  twisty,
};

try {
  (globalThis as any).cubing = cubing;
} catch (e) {
  console.log("Unable to set `cubing` on the global object.");
}

if (globalThis.module?.exports) {
  globalThis.module.exports = cubing;
}
