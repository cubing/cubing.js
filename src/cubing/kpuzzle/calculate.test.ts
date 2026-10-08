import { expect, test } from "bun:test";
import { puzzles } from "../puzzles/index.ts";
import { transformationRepetitionOrder } from "./calculate.ts";

test("allows an empty Alg", async () => {
  const kpuzzle = await puzzles["clock"].kpuzzle();
  const transformation = kpuzzle.algToTransformation("UR5+ y2");
  const order = transformationRepetitionOrder(
    kpuzzle.definition,
    transformation,
  );
  expect(order).toStrictEqual(24);
});
