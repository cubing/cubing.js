import { expect } from "../../../test/chai-workaround";

import { Alg } from "../../alg";
import { giikerMoveToAlgMoveForTesting } from "./giiker";

describe("GiiKerCube", () => {
  // it("should be possible to construct", () => {
  //   new GiiKERi3Cube();
  // });

  it("should calculate giikerMoveToAlgMove() correctly", () => {
    // console.log(new Alg([giikerMoveToAlgMoveForTesting(1, 1)]).toString());
    expect(new Alg([giikerMoveToAlgMoveForTesting(1, 1)])).to.be.identicalAlg(
      new Alg("B"),
    );
    expect(new Alg([giikerMoveToAlgMoveForTesting(2, 3)])).to.be.identicalAlg(
      new Alg("D'"),
    );
    expect(new Alg([giikerMoveToAlgMoveForTesting(3, 9)])).to.be.identicalAlg(
      new Alg("L2'"),
    );
  });
});

// TODO: create a mock BluetoothCube for testing.
