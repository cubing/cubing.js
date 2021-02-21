import { Alg } from "./Alg";
import { BareBlockMove, Sequence } from "./algorithm";
import "./test/structure-equals";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toJSON()).toStructureEqual(
      new Sequence([
        BareBlockMove("R", 1),
        BareBlockMove("U", 1),
        BareBlockMove("R", -1),
      ]),
    );

    expect(Array.from(new Alg("R U R'").units)).toHaveLength(3);
  });
});
