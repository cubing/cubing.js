import { getPuzzleGeometryByName } from "../puzzle-geometry";
import {
  KPuzzleDefinition,
  areStatesEquivalent,
  combineTransformations,
} from ".";
import { Canonicalizer, CanonicalSequenceIterator } from "./canonicalize";
import { Alg } from "../alg";

describe("CanonSequences", () => {
  it("should merge sequences (megaminx test)", () => {
    const pg = getPuzzleGeometryByName("megaminx", {});
    const def = pg.writekpuzzle(false) as KPuzzleDefinition;
    const canon = new Canonicalizer(def);
    const a1 = "U F2 BL R3 L3";
    const a2 = "L2 BL2 F' U2";
    const ss1 = canon.sequenceToSearchSequence(Alg.fromString(a1));
    expect(ss1.moveseq.length).toBe(5);
    const ss2 = canon.sequenceToSearchSequence(Alg.fromString(a2));
    expect(ss2.moveseq.length).toBe(4);
    const ss3 = canon.mergeSequenceToSearchSequence(
      Alg.fromString(a1 + " " + a2),
    );
    expect(ss3.moveseq.length).toBe(6);
    expect(ss3.getSequenceAsString()).toBe("U F2 BL2' R2' F' U2");
    expect(
      areStatesEquivalent(
        def,
        ss3.trans,
        combineTransformations(def, ss1.trans, ss2.trans),
      ),
    ).toBeTruthy();
  });
  it("should generate canonical sequences (3x3x3 test)", () => {
    const pg = getPuzzleGeometryByName("3x3x3", { allMoves: false });
    const def = pg.writekpuzzle(false) as KPuzzleDefinition;
    const canon = new Canonicalizer(def);
    const cnts = [0, 0, 0, 0];
    const csi = new CanonicalSequenceIterator(canon);
    const gen = csi.generator();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const seq = gen.next();
      const len = seq.value.moveseq.length;
      if (len > 3) {
        break;
      }
      cnts[len]++;
    }
    expect(cnts).toStrictEqual([1, 18, 243, 3240]);
  });
});
