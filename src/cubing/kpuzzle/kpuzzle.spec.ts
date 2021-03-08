import { Move } from "../alg";
import { puzzles } from "../puzzles";
import { KPuzzle } from "./kpuzzle";

describe("applyBlockMove()", () => {
  it("should be able to apply a SiGN move", async () => {
    const p = new KPuzzle(await puzzles["3x3x3"].def());
    p.applyMove(new Move("U"));
    // tslint:disable-next-line: no-string-literal
    expect(p.state.orbits["EDGES"].permutation[0]).toEqual(1);
  });
});
