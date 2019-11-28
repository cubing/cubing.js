import { parse, Sequence, structureEquals } from "../alg";

import { giikerMoveToBlockMoveForTesting } from "./giiker";

describe("GiiKerCube", () => {
  // it("should be possible to construct", () => {
  //   new GiiKERi3Cube();
  // });

  it("should calculate giikerMoveToAlgMove() correctly", () => {
    expect(structureEquals(
      new Sequence([giikerMoveToBlockMoveForTesting(1, 1)]),
      parse("B"),
    )).toBe(true);
    expect(structureEquals(
      new Sequence([giikerMoveToBlockMoveForTesting(2, 3)]),
      parse("D'"),
    )).toBe(true);
    expect(structureEquals(
      new Sequence([giikerMoveToBlockMoveForTesting(3, 9)]),
      parse("L2"),
    )).toBe(true);
  });
});

// TODO: create a mock BluetoothCube for testing.
