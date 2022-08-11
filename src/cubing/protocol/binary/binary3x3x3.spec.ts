const { expect: untypedExpect } = await import("@esm-bundle/chai");
const expect: typeof import("chai").expect = untypedExpect;

import type { KState } from "../../kpuzzle/KState";
import { experimental3x3x3KPuzzle } from "../../puzzles/cubing-private";
import {
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "./binary3x3x3";
import { bufferToSpacedHex } from "./hex";

function stateForAlg(alg: string): KState {
  return experimental3x3x3KPuzzle.algToTransformation(alg).toKState();
}

describe("Binary 3x3x3", () => {
  it("converts to binary", () => {
    expect(reid3x3x3ToTwizzleBinary(stateForAlg(""))).to.deep.equal(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
    );

    // Superflip (without center rotation)
    expect(
      reid3x3x3ToTwizzleBinary(stateForAlg("((M' U')4 [U2, M' E2 M] x y)3")),
    ).to.deep.equal(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 16, 0]));

    // Simple superflip (with center rotation)
    expect(
      reid3x3x3ToTwizzleBinary(stateForAlg("((M' U')4 x y)3")),
    ).to.deep.equal(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 26, 170]));

    // Swap last 2 edges and last 2 corner
    expect(
      reid3x3x3ToTwizzleBinary(
        stateForAlg("L2 F2 U' R2 U F2 L2 D2 L2 D2 L2 U B2 D B2 U'"),
      ),
    ).to.deep.equal(new Uint8Array([0, 0, 0, 8, 0, 0, 0, 128, 0, 16, 33]));

    // Rotate top center 180°
    expect(
      reid3x3x3ToTwizzleBinary(stateForAlg("(R' U' R U')5")),
    ).to.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0]));

    // CO
    expect(
      reid3x3x3ToTwizzleBinary(
        stateForAlg("(L U L' U L U2 L' R' U' R U' R' U2' R z)4"),
      ),
    ).to.deep.equal(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 66, 128, 16, 0]));
  });

  it("handles rotations", () => {
    expect(reid3x3x3ToTwizzleBinary(stateForAlg("z y"))).to.deep.equal(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 176, 0]),
    );

    expect(reid3x3x3ToTwizzleBinary(stateForAlg("x2 z'"))).to.deep.equal(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 240, 0]),
    );
  });

  it("validates", () => {
    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([255, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
      );
    }).to.throw("epLex (534773760) out of range");

    // Requires MO support for now.
    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      );
    }).to.throw();

    expect(() => {
      // 0x111 (idxU)
      twizzleBinaryToReid3x3x3(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 3, 144, 0]),
      );
    }).not.to.throw();

    expect(() => {
      twizzleBinaryToReid3x3x3(
        new Uint8Array([255, 0, 0, 0, 0, 127, 0, 0, 0, 16, 0]),
      );
    }).to.throw("epLex (534773760) out of range, cpLex (65024) out of range");
  });

  it("round-trips 3.47 WR scramble", () => {
    const state = stateForAlg("F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2");
    expect(
      twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(state)),
    ).to.deep.equal(state);
  });

  it("round-trips 7.08 WR scramble", () => {
    const state = stateForAlg(
      "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
    );
    expect(
      twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(state)),
    ).to.deep.equal(state);
  });

  it("round-trips 7.08 WR scramble with extra orientation", () => {
    const state = stateForAlg(
      "x D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R y",
    );
    expect(state.stateData["CENTERS"].pieces).to.deep.equal([2, 5, 3, 0, 1, 4]);
    expect(
      twizzleBinaryToReid3x3x3(reid3x3x3ToTwizzleBinary(state)),
    ).to.deep.equal(state);
  });
});

describe("puzzle orientation", () => {
  it("doesn't affect encoded permutation (relative to centers)", () => {
    const state = stateForAlg(
      "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
    );
    expect(state.stateData["CENTERS"].pieces).to.deep.equal([0, 1, 2, 3, 4, 5]);
    const rotatedState = stateForAlg(
      "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R x y",
    );
    expect(rotatedState.stateData["CENTERS"].pieces).to.deep.equal([
      2, 5, 3, 0, 1, 4,
    ]);
    const buffy = new Uint8Array(reid3x3x3ToTwizzleBinary(rotatedState));
    buffy[8] ^= 0b00000001;
    buffy[9] ^= 0b01100000;
    expect(twizzleBinaryToReid3x3x3(buffy)).to.deep.equal(state);
  });
});

describe("Hex", () => {
  it("conversion works", () => {
    expect(
      bufferToSpacedHex(reid3x3x3ToTwizzleBinary(stateForAlg(""))),
    ).to.deep.equal("00 00 00 00 00 00 00 00 00 10 00");
  });
});
