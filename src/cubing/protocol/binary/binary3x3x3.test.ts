import { expect, test } from "bun:test";

import { KPattern } from "../../kpuzzle/KPattern";
import { experimental3x3x3KPuzzle } from "../../puzzles/cubing-private";
import {
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "./binary3x3x3";
import { bufferToSpacedHex } from "./hex";

function patternForAlg(alg: string): KPattern {
  return experimental3x3x3KPuzzle.algToTransformation(alg).toKPattern();
}

const supersolved = new KPattern(
  experimental3x3x3KPuzzle,
  structuredClone(experimental3x3x3KPuzzle.defaultPattern().patternData),
);
delete supersolved.patternData["CENTERS"].orientationMod;
function superPatternForAlg(alg: string): KPattern {
  return supersolved.applyAlg(alg);
}

test("converts to binary", () => {
  expect(reid3x3x3ToTwizzleBinary(patternForAlg(""))).toEqual(
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  );
  expect(reid3x3x3ToTwizzleBinary(superPatternForAlg(""))).toEqual(
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
  );

  // Superflip (without center rotation)
  expect(
    reid3x3x3ToTwizzleBinary(
      superPatternForAlg("((M' U')4 [U2, M' E2 M] x y)3"),
    ),
  ).toEqual(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 16, 0]));

  // Simple superflip (with center rotation)
  expect(
    reid3x3x3ToTwizzleBinary(superPatternForAlg("((M' U')4 x y)3")),
  ).toEqual(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 26, 170]));

  // Swap last 2 edges and last 2 corner
  expect(
    reid3x3x3ToTwizzleBinary(
      superPatternForAlg("L2 F2 U' R2 U F2 L2 D2 L2 D2 L2 U B2 D B2 U'"),
    ),
  ).toEqual(new Uint8Array([0, 0, 0, 8, 0, 0, 0, 128, 0, 16, 33]));

  // Rotate top center 180°
  expect(reid3x3x3ToTwizzleBinary(superPatternForAlg("(R' U' R U')5"))).toEqual(
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0]),
  );

  // CO
  expect(
    reid3x3x3ToTwizzleBinary(
      superPatternForAlg("(L U L' U L U2 L' R' U' R U' R' U2' R z)4"),
    ),
  ).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 66, 128, 16, 0]));
});

test("handles rotations", () => {
  expect(reid3x3x3ToTwizzleBinary(superPatternForAlg("z y"))).toEqual(
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 176, 0]),
  );

  expect(reid3x3x3ToTwizzleBinary(superPatternForAlg("x2 z'"))).toEqual(
    new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 240, 0]),
  );
});

test("validates", () => {
  expect(() => {
    twizzleBinaryToReid3x3x3(
      new Uint8Array([255, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
    );
  }).toThrow("epLex (534773760) out of range");

  // Allow missing MO support.
  expect(() => {
    twizzleBinaryToReid3x3x3(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  }).not.toThrow();

  expect(() => {
    // 0x111 (idxU)
    twizzleBinaryToReid3x3x3(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 3, 144, 0]),
    );
  }).not.toThrow();

  expect(() => {
    twizzleBinaryToReid3x3x3(
      new Uint8Array([255, 0, 0, 0, 0, 127, 0, 0, 0, 16, 0]),
    );
  }).toThrow("epLex (534773760) out of range, cpLex (65024) out of range");
});

test("round-trips 3.47 WR scramble", () => {
  const pattern = superPatternForAlg(
    "F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2",
  );
  expect(twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(pattern))).toEqual(
    pattern,
  );
});

test("round-trips 7.08 WR scramble", () => {
  const pattern = superPatternForAlg(
    "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
  );
  expect(twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(pattern))).toEqual(
    pattern,
  );
});

test("round-trips 7.08 WR scramble with extra orientation", () => {
  const pattern = superPatternForAlg(
    "x D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R y",
  );
  expect(pattern.patternData["CENTERS"].pieces).toEqual([2, 5, 3, 0, 1, 4]);
  expect(twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(pattern))).toEqual(
    pattern,
  );
});

test("puzzle orientation doesn't affect encoded permutation (relative to centers)", () => {
  const pattern = superPatternForAlg(
    "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
  );
  expect(pattern.patternData["CENTERS"].pieces).toEqual([0, 1, 2, 3, 4, 5]);
  const rotatedPattern = superPatternForAlg(
    "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R x y",
  );
  expect(rotatedPattern.patternData["CENTERS"].pieces).toEqual([
    2, 5, 3, 0, 1, 4,
  ]);
  const buffy = new Uint8Array(reid3x3x3ToTwizzleBinary(rotatedPattern));
  buffy[8] ^= 0b00000001;
  buffy[9] ^= 0b01100000;
  expect(twizzleBinaryToReid3x3x3(buffy)).toEqual(pattern);
});
test("hex conversion works", () => {
  expect(
    bufferToSpacedHex(reid3x3x3ToTwizzleBinary(superPatternForAlg(""))),
  ).toEqual("00 00 00 00 00 00 00 00 00 10 00");
  expect(
    bufferToSpacedHex(reid3x3x3ToTwizzleBinary(patternForAlg(""))),
  ).toEqual("00 00 00 00 00 00 00 00 00 00 00");
});
