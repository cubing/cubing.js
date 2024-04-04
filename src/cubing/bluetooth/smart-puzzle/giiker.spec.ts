import { expect, test } from "bun:test";

import { Alg } from "../../alg";
import { giikerMoveToAlgMoveForTesting } from "./giiker";

test("should calculate giikerMoveToAlgMove() correctly", () => {
  // console.log(new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).toString());
  expect(
    new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).isIdentical(new Alg("B")),
  ).toBeTrue();
  expect(
    new Alg([giikerMoveToAlgMoveForTesting(2, 3)]).isIdentical(new Alg("D'")),
  ).toBeTrue();
  expect(
    new Alg([giikerMoveToAlgMoveForTesting(3, 9)]).isIdentical(new Alg("L2'")),
  ).toBeTrue();
});

// TODO: create a mock BluetoothCube for testing.
