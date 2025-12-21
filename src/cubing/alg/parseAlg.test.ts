import { expect, test } from "bun:test";
import { Alg } from ".";
import { setAlgDebug } from "./debug";
import { parseAlg } from "./parseAlg";

test("handles 0 amounts", () => {
  expect(parseAlg("R0").toString()).toStrictEqual("R0");
  // We currently allow `R0'` because some programs might need to go out of their
  // way to avoid producing it in an edge cases. It's interpreted the same as
  // `R0`.
  expect(parseAlg("R0'").toString()).toStrictEqual("R0");
  expect(() => parseAlg("R01")).toThrow(
    "Error at char index 1: An amount can only start with 0 if it's exactly the digit 0.",
  );
  expect(() => parseAlg("R00")).toThrow(
    "Error at char index 1: An amount can only start with 0 if it's exactly the digit 0.",
  );
});

test("parses Clock notation", () => {
  expect(
    parseAlg(
      "  UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+  ALL5+ UL",
    ).toString(),
  ).toStrictEqual(
    "UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+ ALL5+ UL",
  );
  expect(parseAlg("UR_PLUS_4 D_PLUS_3' U1+").toString()).toStrictEqual(
    "UR4+ D3- U1+",
  );
  expect(() => parseAlg("UR+").toString()).toThrow(
    "Clock dial moves must have an amount written as a natural number followed by + or -.",
  );
  expect(() => parseAlg("UR+2").toString()).toThrow(
    "Clock dial moves must have an amount written as a natural number followed by + or -.",
  );
  expect(() => parseAlg("UR1+2").toString()).toThrow(
    "Unexpected character at index 4. Are you missing a space?",
  ); // TODO: Better message
});

test("parses Megaminx notation", () => {
  expect(parseAlg(" R++  D-- U'  \n  R++ D++ U").toString()).toStrictEqual(
    "R++ D-- U'\nR++ D++ U",
  );
  expect(parseAlg("R_PLUSPLUS_ D_PLUSPLUS_'").toString()).toStrictEqual(
    "R++ D--",
  );
  expect(() => parseAlg("R1++").toString()).toThrow(
    "Pochmann ++ or -- moves cannot have an amount written as a number.",
  );
  expect(() => parseAlg("R2++").toString()).toThrow(
    "Pochmann ++ or -- moves cannot have an amount other than 1.",
  );
});

test("parses Square-1 notation", () => {
  expect(
    parseAlg(
      "/ (-3,0) /  (0, 3)/ (0,-3)/ (0,3) / (2,0) / (0,2)/ (-2,0) / (4,0)  /  (0,-2) / (0, 2) / (-1,4) / (0, -3) / (0, 3)",
    ).toString(),
  ).toStrictEqual(
    "/ (-3, 0) / (0, 3) / (0, -3) / (0, 3) / (2, 0) / (0, 2) / (-2, 0) / (4, 0) / (0, -2) / (0, 2) / (-1, 4) / (0, -3) / (0, 3)",
  );
  expect(
    parseAlg("_SLASH_ (U_SQ_3' D_SQ_0) / (0, 3)").toString(),
  ).toStrictEqual("/ (-3, 0) / (0, 3)");
  expect(() => parseAlg("(3, 4) /(1, 2)").toString()).toThrow(
    "Unexpected character at index 8. Are you missing a space?",
  );
});

test("does not allow caret NISS notation when disabled", () => {
  try {
    setAlgDebug({ caretNISSNotationEnabled: false });
    expect(() => parseAlg("R ^(U) D").toString()).toThrow(
      "Alg contained a caret but caret NISS notation is not enabled.",
    );
  } finally {
    setAlgDebug({ caretNISSNotationEnabled: true });
  }
});
test("parses caret NISS notation by default", () => {
  expect(
    parseAlg("R ^(U L) D").isIdentical(new Alg("R . D (U L)'")),
  ).toBeTrue();
});
