import { Alg } from "../alg";
import { giikerMoveToAlgMoveForTesting } from "./giiker";
import "../alg/test/alg-comparison";

describe("GiiKerCube", () => {
  // it("should be possible to construct", () => {
  //   new GiiKERi3Cube();
  // });

  it("should calculate giikerMoveToAlgMove() correctly", () => {
    console.log(new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).toString());
    expect(new Alg([giikerMoveToAlgMoveForTesting(1, 1)])).toBeIdentical(
      new Alg("B"),
    );
    expect(new Alg([giikerMoveToAlgMoveForTesting(2, 3)])).toBeIdentical(
      new Alg("D'"),
    );
    expect(new Alg([giikerMoveToAlgMoveForTesting(3, 9)])).toBeIdentical(
      new Alg("L2'"),
    );
  });
});

// TODO: create a mock BluetoothCube for testing.
