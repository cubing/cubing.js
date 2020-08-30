import { BareBlockMove } from "../alg";
import { KPuzzle } from "./kpuzzle";
import { Puzzles } from "./puzzle_definitions";

describe("applyBlockMove()", () => {
  it("should be able to apply a SiGN move", () => {
    const p = new KPuzzle(Puzzles["3x3x3"]);
    p.applyBlockMove(BareBlockMove("U", 1));
    // tslint:disable-next-line: no-string-literal
    expect(p.state["EDGES"].permutation[0]).toEqual(1);
  });
});
