import { expect, test } from "bun:test";

import { bufferToSpacedHex, spacedHexToBuffer } from "./hex";

test("converts to hex", () => {
  expect(
    bufferToSpacedHex(new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 250, 170])),
  ).toStrictEqual("00 00 00 00 20 00 00 00 ff fa aa");
});

test("converts to buffer", () => {
  expect(spacedHexToBuffer("00 00 00 00 20 00 00 00 ff fa aa")).toEqual(
    new Uint8Array([0, 0, 0, 0, 32, 0, 0, 0, 255, 250, 170]),
  );
});
