import { Alg } from "../../../alg";
import { KPuzzle } from "../kpuzzle";
import { cube3x3x3KPuzzle } from "./3x3x3.kpuzzle.json";

function transformationForAlg(alg: string | Alg) {
  const kpuzzle = new KPuzzle(cube3x3x3KPuzzle);
  kpuzzle.applyAlg(new Alg(alg));
  return kpuzzle.state;
}

describe("3x3x3 definition", () => {
  it("should have consistent moves", () => {
    expect(transformationForAlg("r")).not.toEqual(transformationForAlg("R M"));

    expect(transformationForAlg("u")).toEqual(transformationForAlg("U E'"));
    expect(transformationForAlg("l")).toEqual(transformationForAlg("L M"));
    expect(transformationForAlg("f")).toEqual(transformationForAlg("F S"));
    expect(transformationForAlg("r")).toEqual(transformationForAlg("R M'"));
    expect(transformationForAlg("b")).toEqual(transformationForAlg("B S'"));
    expect(transformationForAlg("d")).toEqual(transformationForAlg("D E"));

    expect(transformationForAlg("u")).toEqual(transformationForAlg("Uw"));
    expect(transformationForAlg("l")).toEqual(transformationForAlg("Lw"));
    expect(transformationForAlg("f")).toEqual(transformationForAlg("Fw"));
    expect(transformationForAlg("r")).toEqual(transformationForAlg("Rw"));
    expect(transformationForAlg("b")).toEqual(transformationForAlg("Bw"));
    expect(transformationForAlg("d")).toEqual(transformationForAlg("Dw"));

    expect(transformationForAlg("x")).toEqual(transformationForAlg("R M' L'"));
    expect(transformationForAlg("y")).toEqual(transformationForAlg("U E' D'"));
    expect(transformationForAlg("z")).toEqual(transformationForAlg("F S B'"));

    expect(transformationForAlg("Uv")).toEqual(transformationForAlg("y"));
    expect(transformationForAlg("Lv")).toEqual(transformationForAlg("x'"));
    expect(transformationForAlg("Fv")).toEqual(transformationForAlg("z"));
    expect(transformationForAlg("Rv")).toEqual(transformationForAlg("x"));
    expect(transformationForAlg("Bv")).toEqual(transformationForAlg("z'"));
    expect(transformationForAlg("Dv")).toEqual(transformationForAlg("y'"));
  });
});
