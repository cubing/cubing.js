import { Alg } from "../alg";
import { giikerTurnToAlgTurnForTesting } from "./giiker";
import "../alg/test/alg-comparison";

describe("GiiKerCube", () => {
  // it("should be possible to construct", () => {
  //   new GiiKERi3Cube();
  // });

  it("should calculate giikerTurnToAlgTurn() correctly", () => {
    console.log(new Alg([giikerTurnToAlgTurnForTesting(1, 1)]).toString());
    expect(new Alg([giikerTurnToAlgTurnForTesting(1, 1)])).toBeIdentical(
      new Alg("B"),
    );
    expect(new Alg([giikerTurnToAlgTurnForTesting(2, 3)])).toBeIdentical(
      new Alg("D'"),
    );
    expect(new Alg([giikerTurnToAlgTurnForTesting(3, 9)])).toBeIdentical(
      new Alg("L2'"),
    );
  });
});

// TODO: create a mock BluetoothCube for testing.
