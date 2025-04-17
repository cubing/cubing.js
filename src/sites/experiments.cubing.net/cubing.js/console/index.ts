import * as alg from "../../../../cubing/alg";
import * as bluetooth from "../../../../cubing/bluetooth";
import * as kpuzzle from "../../../../cubing/kpuzzle";
import * as notation from "../../../../cubing/notation";
import * as protocol from "../../../../cubing/protocol";
import * as puzzleGeometry from "../../../../cubing/puzzle-geometry";
import * as puzzles from "../../../../cubing/puzzles";
import * as scramble from "../../../../cubing/scramble";
import * as search from "../../../../cubing/search";
import * as stream from "../../../../cubing/stream";
import * as twisty from "../../../../cubing/twisty";

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
  (window as any)[moduleName] = moduleExport;
}
