import { expect, test } from "bun:test";

import {
  lexToPermutation,
  maskToOrientations,
  orientationsToMask,
  permutationToLex,
} from "./orbit-indexing";

test("indexes", () => {
  expect(permutationToLex([0, 1, 2])).toStrictEqual(0);
  expect(permutationToLex([0, 2, 1])).toStrictEqual(1);
  expect(permutationToLex([2, 0, 1])).toStrictEqual(4);
  expect(permutationToLex([0, 1, 2, 3, 4, 5])).toStrictEqual(0);
  expect(permutationToLex([5, 4, 3, 2, 1, 0])).toStrictEqual(719);
});

test("un-indexes", () => {
  expect(lexToPermutation(3, 0)).toEqual([0, 1, 2]);
  expect(lexToPermutation(3, 1)).toEqual([0, 2, 1]);
  expect(lexToPermutation(3, 4)).toEqual([2, 0, 1]);
  expect(lexToPermutation(6, 0)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(lexToPermutation(6, 719)).toEqual([5, 4, 3, 2, 1, 0]);
});

test("orients", () => {
  expect(orientationsToMask(2, [1, 0, 0, 1, 0, 1, 1, 0])).toStrictEqual(
    0b10010110,
  );
});

test("orientationRangeToMask converts to mask correctly", () => {
  expect(
    orientationsToMask(2, [0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1]),
  ).toStrictEqual(1217);
});
test("orientationRangeToMask converts from mask correctly", () => {
  expect(maskToOrientations(2, 12, 1217)).toEqual([
    0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
  ]);
});
test("orientationRangeToMask round-trips", () => {
  expect(maskToOrientations(3, 4, orientationsToMask(3, [2, 0, 2, 1]))).toEqual(
    [2, 0, 2, 1],
  );
  expect(
    maskToOrientations(4, 6, orientationsToMask(4, [2, 1, 0, 3, 2, 2])),
  ).toEqual([2, 1, 0, 3, 2, 2]);
});
