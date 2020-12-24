import { getPuzzleGeometryByName } from "../puzzle-geometry";
import { KPuzzleDefinition, EquivalentStates, Combine } from ".";
import { parseAlg } from "../alg";
import { Canonicalize, CanonicalSequenceIterator } from "./canonicalize";
describe("CanonSequences", () => {
  it("should merge sequences (megaminx test)", () => {
    const options: string[] = [];
    const pg = getPuzzleGeometryByName("megaminx", options);
    const def = pg.writekpuzzle(false) as KPuzzleDefinition;
    const canon = new Canonicalize(def);
    const a1 = "U F2 BL R3 L3";
    const a2 = "L2 BL2 F' U2";
    const ss1 = canon.sequenceToSearchSequence(parseAlg(a1));
    expect(ss1.moveseq.length).toBe(5);
    const ss2 = canon.sequenceToSearchSequence(parseAlg(a2));
    expect(ss2.moveseq.length).toBe(4);
    const ss3 = canon.mergeSequenceToSearchSequence(parseAlg(a1 + " " + a2));
    expect(ss3.moveseq.length).toBe(6);
    expect(ss3.getSequenceAsString()).toBe("U F2 BL2' R2' F' U2");
    expect(
      EquivalentStates(def, ss3.trans, Combine(def, ss1.trans, ss2.trans)),
    ).toBeTruthy();
  });
  it("should generate canonical sequences (3x3x3 test)", () => {
    const options: string[] = ["allmoves", "false"];
    const pg = getPuzzleGeometryByName("3x3x3", options);
    const def = pg.writekpuzzle(false) as KPuzzleDefinition;
    const canon = new Canonicalize(def);
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
