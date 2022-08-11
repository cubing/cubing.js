import { expect } from "../../../test/chai-workaround";

import { Alg } from "../../alg";
import { giikerMoveToAlgMoveForTesting } from "./giiker";

describe("GiiKerCube", () => {
  // it("should be possible to construct", () => {
  //   new GiiKERi3Cube();
  // });

  it("should calculate giikerMoveToAlgMove() correctly", () => {
    // console.log(new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).toString());
    expect(
      new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).isIdentical(new Alg("B")),
    ).to.be.true;
    expect(
      new Alg([giikerMoveToAlgMoveForTesting(2, 3)]).isIdentical(new Alg("D'")),
    ).to.be.true;
    expect(
      new Alg([giikerMoveToAlgMoveForTesting(3, 9)]).isIdentical(
        new Alg("L2'"),
      ),
    ).to.be.true;
  });
});

// TODO: create a mock BluetoothCube for testing.
