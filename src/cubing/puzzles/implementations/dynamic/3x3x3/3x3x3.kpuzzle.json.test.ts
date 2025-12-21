import { expect, test } from "bun:test";

import { KPuzzle } from "../../../../kpuzzle";
import { cube3x3x3KPuzzleDefinition } from "./3x3x3.kpuzzle.json";

const kpuzzle = new KPuzzle(cube3x3x3KPuzzleDefinition);

test("3x3x3 definition should have consistent moves", () => {
  expect(kpuzzle.algToTransformation("r")).not.toEqual(
    kpuzzle.algToTransformation("R M"),
  );

  expect(kpuzzle.algToTransformation("u")).toEqual(
    kpuzzle.algToTransformation("U E'"),
  );
  expect(kpuzzle.algToTransformation("l")).toEqual(
    kpuzzle.algToTransformation("L M"),
  );
  expect(kpuzzle.algToTransformation("f")).toEqual(
    kpuzzle.algToTransformation("F S"),
  );
  expect(kpuzzle.algToTransformation("r")).toEqual(
    kpuzzle.algToTransformation("R M'"),
  );
  expect(kpuzzle.algToTransformation("b")).toEqual(
    kpuzzle.algToTransformation("B S'"),
  );
  expect(kpuzzle.algToTransformation("d")).toEqual(
    kpuzzle.algToTransformation("D E"),
  );

  expect(kpuzzle.algToTransformation("u")).toEqual(
    kpuzzle.algToTransformation("Uw"),
  );
  expect(kpuzzle.algToTransformation("l")).toEqual(
    kpuzzle.algToTransformation("Lw"),
  );
  expect(kpuzzle.algToTransformation("f")).toEqual(
    kpuzzle.algToTransformation("Fw"),
  );
  expect(kpuzzle.algToTransformation("r")).toEqual(
    kpuzzle.algToTransformation("Rw"),
  );
  expect(kpuzzle.algToTransformation("b")).toEqual(
    kpuzzle.algToTransformation("Bw"),
  );
  expect(kpuzzle.algToTransformation("d")).toEqual(
    kpuzzle.algToTransformation("Dw"),
  );

  expect(kpuzzle.algToTransformation("x")).toEqual(
    kpuzzle.algToTransformation("R M' L'"),
  );
  expect(kpuzzle.algToTransformation("y")).toEqual(
    kpuzzle.algToTransformation("U E' D'"),
  );
  expect(kpuzzle.algToTransformation("z")).toEqual(
    kpuzzle.algToTransformation("F S B'"),
  );

  expect(kpuzzle.algToTransformation("Uv")).toEqual(
    kpuzzle.algToTransformation("y"),
  );
  expect(kpuzzle.algToTransformation("Lv")).toEqual(
    kpuzzle.algToTransformation("x'"),
  );
  expect(kpuzzle.algToTransformation("Fv")).toEqual(
    kpuzzle.algToTransformation("z"),
  );
  expect(kpuzzle.algToTransformation("Rv")).toEqual(
    kpuzzle.algToTransformation("x"),
  );
  expect(kpuzzle.algToTransformation("Bv")).toEqual(
    kpuzzle.algToTransformation("z'"),
  );
  expect(kpuzzle.algToTransformation("Dv")).toEqual(
    kpuzzle.algToTransformation("y'"),
  );
});
