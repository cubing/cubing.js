import { getPuzzleGeometryByName } from "../puzzle-geometry";
import { KPuzzleDefinition } from ".";
import { parseAlg } from "../alg";
import { Canonicalize } from "./canonicalize";
import { PruningTable } from "./pruningtable";
describe("PruneTable", () => {
  it("solve 2x2x2", () => {
    const options: string[] = [];
    const pg = getPuzzleGeometryByName("2x2x2", options);
    const def = pg.writekpuzzle(false) as KPuzzleDefinition;
    const canon = new Canonicalize(def);
    const a1 = "L' D L2 D' L2 F R' F R' L' F D L2 F2 R' F U B'";
    const ss1 = canon.sequenceToSearchSequence(parseAlg(a1), def.startPieces);
    const pt = new PruningTable(canon);
    const sol = pt.solve(ss1.trans);
    expect(sol).toBe("F L D2 F' D' F2 U F2 L' D2");
  });
});
