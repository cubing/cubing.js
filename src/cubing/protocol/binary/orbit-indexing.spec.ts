import { expect } from "../../../test/chai-workarounds";
import { KTransformationOrbitView } from "../../kpuzzle/KTransformation";

import {
  permutationToLex,
  lexToPermutation,
  orientationsToMask,
  maskToOrientations,
} from "./orbit-indexing";

function fakePermView(numPieces: number, permutation: number[]) {
  return new KTransformationOrbitView(
    {
      numPieces,
      numOrientations: 1,
    },
    {
      DEFAULT_ORBIT: {
        permutation,
      },
    },
    "DEFAULT_ORBIT",
    false,
  );
}

function fakeOriView(
  numPieces: number,
  numOrientations: number,
  orientation: number[],
) {
  return new KTransformationOrbitView(
    {
      numPieces,
      numOrientations,
    },
    {
      DEFAULT_ORBIT: {
        orientation,
      },
    },
    "DEFAULT_ORBIT",
    false,
  );
}

describe("orbit indexing", () => {
  it("indexes", () => {
    expect(permutationToLex(fakePermView(3, [0, 1, 2]))).to.equal(0);
    expect(permutationToLex(fakePermView(3, [0, 2, 1]))).to.equal(1);
    expect(permutationToLex(fakePermView(3, [2, 0, 1]))).to.equal(4);
    expect(permutationToLex(fakePermView(6, [0, 1, 2, 3, 4, 5]))).to.equal(0);
    expect(permutationToLex(fakePermView(6, [5, 4, 3, 2, 1, 0]))).to.equal(719);
  });

  it("un-indexes", () => {
    expect(lexToPermutation(3, 0)).to.deep.equal([0, 1, 2]);
    expect(lexToPermutation(3, 1)).to.deep.equal([0, 2, 1]);
    expect(lexToPermutation(3, 4)).to.deep.equal([2, 0, 1]);
    expect(lexToPermutation(6, 0)).to.deep.equal([0, 1, 2, 3, 4, 5]);
    expect(lexToPermutation(6, 719)).to.deep.equal([5, 4, 3, 2, 1, 0]);
  });

  it("orients", () => {
    expect(
      orientationsToMask(fakeOriView(8, 2, [1, 0, 0, 1, 0, 1, 1, 0])),
    ).to.equal(0b10010110);
  });
});

describe("orientationRangeToMask", () => {
  it("converts to mask correctly", () => {
    expect(
      orientationsToMask(
        fakeOriView(12, 2, [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1]),
      ),
    ).to.equal(1217);
  });
  it("converts from mask correctly", () => {
    expect(maskToOrientations(2, 12, 1217)).to.deep.equal([
      0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    ]);
  });
  it("round-trips", () => {
    expect(
      maskToOrientations(
        3,
        4,
        orientationsToMask(fakeOriView(4, 3, [2, 0, 2, 1])),
      ),
    ).to.deep.equal([2, 0, 2, 1]);
    expect(
      maskToOrientations(
        4,
        6,
        orientationsToMask(fakeOriView(6, 4, [2, 1, 0, 3, 2, 2])),
      ),
    ).to.deep.equal([2, 1, 0, 3, 2, 2]);
  });
});
