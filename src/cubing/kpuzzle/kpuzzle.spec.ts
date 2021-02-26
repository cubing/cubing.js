import { Turn } from "../alg";
import { puzzles } from "../puzzles";
import { KPuzzle } from "./kpuzzle";

describe("applyTurn()", () => {
  it("should be able to apply a SiGN turn", async () => {
    const p = new KPuzzle(await puzzles["3x3x3"].def());
    p.applyTurn(new Turn("U"));
    // tslint:disable-next-line: no-string-literal
    expect(p.state["EDGES"].permutation[0]).toEqual(1);
  });
});
