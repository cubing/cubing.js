import * as alg from "../../../../cubing/alg/index.ts";
import * as bluetooth from "../../../../cubing/bluetooth/index.ts";
import * as kpuzzle from "../../../../cubing/kpuzzle/index.ts";
import * as notation from "../../../../cubing/notation/index.ts";
import * as protocol from "../../../../cubing/protocol/index.ts";
import * as puzzleGeometry from "../../../../cubing/puzzle-geometry/index.ts";
import * as puzzles from "../../../../cubing/puzzles/index.ts";
import * as scramble from "../../../../cubing/scramble/index.ts";
import * as search from "../../../../cubing/search/index.ts";
import * as stream from "../../../../cubing/stream/index.ts";
import * as twisty from "../../../../cubing/twisty/index.ts";

export const cubingGlobalExports = {
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

console.log("cubing", cubingGlobalExports);
for (const [moduleName, moduleExport] of Object.entries(cubingGlobalExports)) {
  console.log(moduleName, moduleExport);
  (globalThis as any)[moduleName] = moduleExport;
}
