import { parseAlg } from "../../alg";
import { KPuzzle, Transformation } from "../../kpuzzle";
import { puzzles } from "../../puzzles";
import {
  reid3x3x3ToTwizzleBinary,
  twizzleBinaryToReid3x3x3,
} from "./binary3x3x3";
import { bufferToSpacedHex } from "./hex";

async function stateForAlg(alg: string): Promise<Transformation> {
  const kpuzzle = new KPuzzle(await puzzles["3x3x3"].def());
  kpuzzle.applyAlg(parseAlg(alg));
  return kpuzzle.state;
}

describe("Binary 3x3x3", () => {
  it("converts to binary", async () => {
    expect(await reid3x3x3ToTwizzleBinary(await await stateForAlg(""))).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
    );

    // Superflip (without center rotation)
    expect(
      await reid3x3x3ToTwizzleBinary(
        await stateForAlg("((M' U')4 [U2, M' E2 M] x y)3"),
      ),
    ).toEqual(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 16, 0]));

    // Simple superflip (with center rotation)
    expect(
      await reid3x3x3ToTwizzleBinary(await stateForAlg("((M' U')4 x y)3")),
    ).toEqual(new Uint8Array([0, 0, 0, 7, 255, 128, 0, 0, 0, 26, 170]));

    // Swap last 2 edges and last 2 corner
    expect(
      await reid3x3x3ToTwizzleBinary(
        await stateForAlg("L2 F2 U' R2 U F2 L2 D2 L2 D2 L2 U B2 D B2 U'"),
      ),
    ).toEqual(new Uint8Array([0, 0, 0, 8, 0, 0, 0, 128, 0, 16, 33]));

    // Rotate top center 180°
    expect(
      await reid3x3x3ToTwizzleBinary(await stateForAlg("(R' U' R U')5")),
    ).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0]));

    // CO
    expect(
      await reid3x3x3ToTwizzleBinary(
        await stateForAlg("(L U L' U L U2 L' R' U' R U' R' U2' R z)4"),
      ),
    ).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 66, 128, 16, 0]));
  });

  it("handles rotations", async () => {
    expect(await reid3x3x3ToTwizzleBinary(await stateForAlg("z y"))).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 176, 0]),
    );

    expect(await reid3x3x3ToTwizzleBinary(await stateForAlg("x2 z'"))).toEqual(
      new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 240, 0]),
    );
  });

  it("validates", async () => {
    expect(async () => {
      await twizzleBinaryToReid3x3x3(
        new Uint8Array([255, 0, 0, 0, 0, 0, 0, 0, 0, 16, 0]),
      );
    }).resolves.toThrow("epLex (534773760) out of range");

    // // Requires MO support for now.
    // expect(async () => {
    //   await twizzleBinaryToReid3x3x3(
    //     new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    //   );
    // }).toThrow();

    // expect(async () => {
    //   // 0x111 (idxU)
    //   await twizzleBinaryToReid3x3x3(
    //     new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 3, 144, 0]),
    //   );
    // }).not.toThrow();

    // expect(async () => {
    //   await twizzleBinaryToReid3x3x3(
    //     new Uint8Array([255, 0, 0, 0, 0, 127, 0, 0, 0, 16, 0]),
    //   );
    // }).toThrow("epLex (534773760) out of range, cpLex (65024) out of range");
  });

  // it("round-trips 3.47 WR scramble", async () => {
  //   const state = await stateForAlg(
  //     "F U2 L2 B2 F' U L2 U R2 D2 L' B L2 B' R2 U2",
  //   );
  //   expect(
  //     twizzleBinaryToReid3x3x3(await reid3x3x3ToTwizzleBinary(state)),
  //   ).toEqual(state);
  // });

  // it("round-trips 7.08 WR scramble", async () => {
  //   const state = await stateForAlg(
  //     "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
  //   );
  //   expect(
  //     twizzleBinaryToReid3x3x3(await reid3x3x3ToTwizzleBinary(state)),
  //   ).toEqual(state);
  // });

  // it("round-trips 7.08 WR scramble with extra orientation", async () => {
  //   const state = await stateForAlg(
  //     "x D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R y",
  //   );
  //   expect(state["CENTERS"].permutation).toEqual([2, 5, 3, 0, 1, 4]);
  //   expect(
  //     twizzleBinaryToReid3x3x3(await reid3x3x3ToTwizzleBinary(state)),
  //   ).toEqual(state);
  // });
});

// describe("puzzle orientation", () => {
//   it("doesn't affect encoded permutation (relative to centers)", async () => {
//     const state = await stateForAlg(
//       "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R",
//     );
//     expect(state["CENTERS"].permutation).toEqual([0, 1, 2, 3, 4, 5]);
//     const rotatedState = await stateForAlg(
//       "D' R2 D L2 B2 L2 D' R2 F' L2 R' F D F' D' L' U2 F' R x y",
//     );
//     expect(rotatedState["CENTERS"].permutation).toEqual([2, 5, 3, 0, 1, 4]);
//     const buffy = new Uint8Array(await reid3x3x3ToTwizzleBinary(rotatedState));
//     buffy[8] ^= 0b00000001;
//     buffy[9] ^= 0b01100000;
//     expect(twizzleBinaryToReid3x3x3(buffy)).toEqual(state);
//   });
// });

// describe("Hex", () => {
//   it("conversion works", async () => {
//     expect(
//       bufferToSpacedHex(await reid3x3x3ToTwizzleBinary(await stateForAlg(""))),
//     ).toBe("00 00 00 00 00 00 00 00 00 10 00");
//   });
// });
