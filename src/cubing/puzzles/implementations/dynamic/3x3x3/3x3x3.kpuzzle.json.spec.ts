import { expect } from "../../../../../test/chai-workarounds";

import { KPuzzle } from "../../../../kpuzzle";
import { cube3x3x3KPuzzleDefinition } from "./3x3x3.kpuzzle.json";

const kpuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);

describe("3x3x3 definition", () => {
  it("should have consistent moves", () => {
    expect(kpuzzle.algToTransformation("r")).not.to.deep.equal(
      kpuzzle.algToTransformation("R M"),
    );

    expect(kpuzzle.algToTransformation("u")).to.deep.equal(
      kpuzzle.algToTransformation("U E'"),
    );
    expect(kpuzzle.algToTransformation("l")).to.deep.equal(
      kpuzzle.algToTransformation("L M"),
    );
    expect(kpuzzle.algToTransformation("f")).to.deep.equal(
      kpuzzle.algToTransformation("F S"),
    );
    expect(kpuzzle.algToTransformation("r")).to.deep.equal(
      kpuzzle.algToTransformation("R M'"),
    );
    expect(kpuzzle.algToTransformation("b")).to.deep.equal(
      kpuzzle.algToTransformation("B S'"),
    );
    expect(kpuzzle.algToTransformation("d")).to.deep.equal(
      kpuzzle.algToTransformation("D E"),
    );

    expect(kpuzzle.algToTransformation("u")).to.deep.equal(
      kpuzzle.algToTransformation("Uw"),
    );
    expect(kpuzzle.algToTransformation("l")).to.deep.equal(
      kpuzzle.algToTransformation("Lw"),
    );
    expect(kpuzzle.algToTransformation("f")).to.deep.equal(
      kpuzzle.algToTransformation("Fw"),
    );
    expect(kpuzzle.algToTransformation("r")).to.deep.equal(
      kpuzzle.algToTransformation("Rw"),
    );
    expect(kpuzzle.algToTransformation("b")).to.deep.equal(
      kpuzzle.algToTransformation("Bw"),
    );
    expect(kpuzzle.algToTransformation("d")).to.deep.equal(
      kpuzzle.algToTransformation("Dw"),
    );

    expect(kpuzzle.algToTransformation("x")).to.deep.equal(
      kpuzzle.algToTransformation("R M' L'"),
    );
    expect(kpuzzle.algToTransformation("y")).to.deep.equal(
      kpuzzle.algToTransformation("U E' D'"),
    );
    expect(kpuzzle.algToTransformation("z")).to.deep.equal(
      kpuzzle.algToTransformation("F S B'"),
    );

    expect(kpuzzle.algToTransformation("Uv")).to.deep.equal(
      kpuzzle.algToTransformation("y"),
    );
    expect(kpuzzle.algToTransformation("Lv")).to.deep.equal(
      kpuzzle.algToTransformation("x'"),
    );
    expect(kpuzzle.algToTransformation("Fv")).to.deep.equal(
      kpuzzle.algToTransformation("z"),
    );
    expect(kpuzzle.algToTransformation("Rv")).to.deep.equal(
      kpuzzle.algToTransformation("x"),
    );
    expect(kpuzzle.algToTransformation("Bv")).to.deep.equal(
      kpuzzle.algToTransformation("z'"),
    );
    expect(kpuzzle.algToTransformation("Dv")).to.deep.equal(
      kpuzzle.algToTransformation("y'"),
    );
  });
});
