import { parse } from "../../alg";
import { KPuzzle, Puzzles, Transformation } from "../../kpuzzle";
import {
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "./binary3x3x3";
import { bufferToSpacedHex } from "./hex";

function stateForAlg(alg: string): Transformation {
  const kpuzzle = new KPuzzle(Puzzles["3x3x3"]);
  kpuzzle.applyAlg(parse(alg));
  return kpuzzle.state;
}

describe("Binary 3x3x3", () => {
  it("converts to binary", () => {
    expect(reid3x3x3ToTwizzleBinary(stateForAlg(""))).toEqual(
      new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 0, 0, 0]),
    );

    // Superflip (without center rotation)
    expect(
      reid3x3x3ToTwizzleBinary(stateForAlg("((M' U')4 [U2, M' E2 M] x y)3")),
    ).toEqual(new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 240, 0]));

    // Simple superflip (with center rotation)
    expect(reid3x3x3ToTwizzleBinary(stateForAlg("((M' U')4 x y)3"))).toEqual(
      new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 250, 170]),
    );

    // Swap last 2 edges and last 2 corner
    expect(
      reid3x3x3ToTwizzleBinary(
        stateForAlg("L2 F2 U' R2 U F2 L2 D2 L2 D2 L2 U B2 D B2 U'"),
      ),
    ).toEqual(new Uint8Array([0, 0, 0, 8, 32, 0, 0, 1, 0, 0, 33]));

    // Rotate top center 180°
    expect(reid3x3x3ToTwizzleBinary(stateForAlg("(R' U' R U')5"))).toEqual(
      new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 0, 8, 0]),
    );
  });

  it("handles rotations", () => {
    expect(reid3x3x3ToTwizzleBinary(stateForAlg("z y"))).toEqual(
      new Uint8Array([0, 0, 0, 1, 96, 0, 0, 0, 0, 0, 0]),
    );

    expect(reid3x3x3ToTwizzleBinary(stateForAlg("x2 z'"))).toEqual(
      new Uint8Array([0, 0, 0, 3, 192 + 32, 0, 0, 0, 0, 0, 0]),
    );
  });

  it("validates", () => {
    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([255, 0, 0, 0, 32, 0, 0, 0, 255, 240, 0]),
      );
    }).toThrow("edgePermutationIdx (534773760) out of range");

    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([0, 0, 0, 7, 32, 0, 0, 0, 255, 240, 0]),
      );
    }).toThrow("idxPuzzleOrientationU (7) out of range");

    expect(() => {
      // 0x111 (idxU) + 0x11 (idxL)
      twizzleBinaryToReid3x3x3(
        new Uint8Array([0, 0, 0, 7, 224, 0, 0, 0, 255, 240, 0]),
      );
    }).not.toThrow();

    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([255, 0, 0, 7, 32, 0, 0, 0, 255, 240, 0]),
      );
    }).toThrow(
      "edgePermutationIdx (534773760) out of range, idxPuzzleOrientationU (7) out of range",
    );
  });

  it("round-trips 3.47 WR scramble", () => {
    const state = stateForAlg("F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2");
    expect(twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(state))).toEqual(
      state,
    );
  });

  it("round-trips 7.08 WR scramble", () => {
    const state = stateForAlg(
      "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
    );
    expect(twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(state))).toEqual(
      state,
    );
  });
});

describe("Hex", () => {
  it("conversion works.", () => {
    expect(bufferToSpacedHex(reid3x3x3ToTwizzleBinary(stateForAlg("")))).toBe(
      "00 00 00 00 20 00 00 00 00 00 00",
    );
  });
});
