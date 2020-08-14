import {
  permutationToLexIdx,
  lexIdxToPermutation,
  orientationRangeToMask,
  maskToOrientationRange,
} from "./orbit-indexing";

describe("orbit indexing", () => {
  it("indexes", () => {
    expect(permutationToLexIdx([0, 1, 2])).toBe(0);
    expect(permutationToLexIdx([0, 2, 1])).toBe(1);
    expect(permutationToLexIdx([2, 0, 1])).toBe(4);
    expect(permutationToLexIdx([0, 1, 2, 3, 4, 5])).toBe(0);
    expect(permutationToLexIdx([5, 4, 3, 2, 1, 0])).toBe(719);
  });

  it("un-indexes", () => {
    expect(lexIdxToPermutation(3, 0)).toEqual([0, 1, 2]);
    expect(lexIdxToPermutation(3, 1)).toEqual([0, 2, 1]);
    expect(lexIdxToPermutation(3, 4)).toEqual([2, 0, 1]);
    expect(lexIdxToPermutation(6, 0)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(lexIdxToPermutation(6, 719)).toEqual([5, 4, 3, 2, 1, 0]);
  });

  it("orients", () => {
    expect(orientationRangeToMask(2, [1, 0, 0, 1, 0, 1, 1, 0], 0, 8)).toEqual(
      0b10010110,
    );
  });
});

describe("orientationRangeToMask", () => {
  it("converts to mask correctly", () => {
    expect(
      orientationRangeToMask(2, [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1], 0, 12),
    ).toBe(1217);
  });
  it("converts from mask correctly", () => {
    expect(maskToOrientationRange(2, 12, 1217)).toEqual([
      0,
      1,
      0,
      0,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
    ]);
  });
  it("round-trips", () => {
    expect(
      maskToOrientationRange(
        3,
        4,
        orientationRangeToMask(3, [2, 0, 2, 1], 0, 4),
      ),
    ).toEqual([2, 0, 2, 1]);
    expect(
      maskToOrientationRange(
        4,
        6,
        orientationRangeToMask(4, [2, 1, 0, 3, 2, 2], 0, 6),
      ),
    ).toEqual([2, 1, 0, 3, 2, 2]);
  });
});
