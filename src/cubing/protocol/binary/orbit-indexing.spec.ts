import { expect } from "../../../test/chai-workaround";

import {
  permutationToLex,
  lexToPermutation,
  orientationsToMask,
  maskToOrientations,
} from "./orbit-indexing";

describe("orbit indexing", () => {
  it("indexes", () => {
    expect(permutationToLex([0, 1, 2])).to.equal(0);
    expect(permutationToLex([0, 2, 1])).to.equal(1);
    expect(permutationToLex([2, 0, 1])).to.equal(4);
    expect(permutationToLex([0, 1, 2, 3, 4, 5])).to.equal(0);
    expect(permutationToLex([5, 4, 3, 2, 1, 0])).to.equal(719);
  });

  it("un-indexes", () => {
    expect(lexToPermutation(3, 0)).to.deep.equal([0, 1, 2]);
    expect(lexToPermutation(3, 1)).to.deep.equal([0, 2, 1]);
    expect(lexToPermutation(3, 4)).to.deep.equal([2, 0, 1]);
    expect(lexToPermutation(6, 0)).to.deep.equal([0, 1, 2, 3, 4, 5]);
    expect(lexToPermutation(6, 719)).to.deep.equal([5, 4, 3, 2, 1, 0]);
  });

  it("orients", () => {
    expect(orientationsToMask(2, [1, 0, 0, 1, 0, 1, 1, 0])).to.equal(
      0b10010110,
    );
  });
});

describe("orientationRangeToMask", () => {
  it("converts to mask correctly", () => {
    expect(
      orientationsToMask(2, [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1]),
    ).to.equal(1217);
  });
  it("converts from mask correctly", () => {
    expect(maskToOrientations(2, 12, 1217)).to.deep.equal([
      0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    ]);
  });
  it("round-trips", () => {
    expect(
      maskToOrientations(3, 4, orientationsToMask(3, [2, 0, 2, 1])),
    ).to.deep.equal([2, 0, 2, 1]);
    expect(
      maskToOrientations(4, 6, orientationsToMask(4, [2, 1, 0, 3, 2, 2])),
    ).to.deep.equal([2, 1, 0, 3, 2, 2]);
  });
});
