import { bufferToSpacedHex, spacedHexToBuffer } from "./hex";

describe("hex", () => {
  it("converts to hex", () => {
    expect(
      bufferToSpacedHex(
        new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 250, 170]),
      ),
    ).toBe("00 00 00 00 20 00 00 00 ff fa aa");
  });

  it("converts to buffer", () => {
    expect(spacedHexToBuffer("00 00 00 00 20 00 00 00 ff fa aa")).toEqual(
      new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 250, 170]),
    );
  });
});
