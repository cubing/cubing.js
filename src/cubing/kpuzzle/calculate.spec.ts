import { expect } from "../../test/chai-workarounds";
import { puzzles } from "../puzzles";
import { transformationRepetitionOrder } from "./calculate";

describe("Alg", () => {
  it("allows an empty Alg", async () => {
    const kpuzzle = await puzzles["clock"].kpuzzle();
    const transformation = kpuzzle.algToTransformation("UR5+ y2");
    const order = transformationRepetitionOrder(
      kpuzzle.definition,
      transformation,
    );
    expect(order).to.equal(24);
  });
});
