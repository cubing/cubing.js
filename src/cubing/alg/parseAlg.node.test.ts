import assert from "node:assert";
import { test } from "node:test";
import { setAlgDebug } from "./debug.ts";
import { Alg } from "./index.ts";
import { parseAlg } from "./parseAlg.ts";

function expectError(fn: () => any, err: string | RegExp): void;
function expectError(
  fn: () => any | Promise<any>,
  err: string | RegExp,
): Promise<void>;
async function expectError(
  fn: () => any | Promise<any>,
  err: string | RegExp,
): Promise<void> {
  if (typeof err === "string") {
    err = new RegExp(RegExp.escape(err));
  }

  await test({ expectFailure: { match: err } }, async () => {
    await fn();
  });
}

test("handles 0 amounts", () => {
  assert.strictEqual(parseAlg("R0").toString(), "R0");
  // We currently allow `R0'` because some programs might need to go out of their
  // way to avoid producing it in an edge cases. It's interpreted the same as
  // `R0`.
  assert.strictEqual(parseAlg("R0'").toString(), "R0");
  expectError(
    () => parseAlg("R01"),
    "Error at char index 1: An amount can only start with 0 if it's exactly the digit 0.",
  );
  expectError(
    () => parseAlg("R00"),
    "Error at char index 1: An amount can only start with 0 if it's exactly the digit 0.",
  );
});

test("parses Clock notation", () => {
  assert.strictEqual(
    parseAlg(
      "  UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+  ALL5+ UL",
    ).toString(),
    "UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+ ALL5+ UL",
  );
  assert.strictEqual(
    parseAlg("UR_PLUS_4 D_PLUS_3' U1+").toString(),
    "UR4+ D3- U1+",
  );
  expectError(() => {
    parseAlg("UR+").toString();
  }, "Clock dial moves must have an amount written as a natural number followed by + or -.");
  expectError(() => {
    parseAlg("UR+2").toString();
  }, "Clock dial moves must have an amount written as a natural number followed by + or -.");
  expectError(() => {
    parseAlg("UR1+2").toString(); // TODO: Better message
  }, "Unexpected character at index 4. Are you missing a space?");
});

test("parses Megaminx notation", () => {
  assert.strictEqual(
    parseAlg(" R++  D-- U'  \n  R++ D++ U").toString(),
    "R++ D-- U'\nR++ D++ U",
  );
  assert.strictEqual(
    parseAlg("R_PLUSPLUS_ D_PLUSPLUS_'").toString(),
    "R++ D--",
  );
  expectError(() => {
    parseAlg("R1++").toString();
  }, "Pochmann ++ or -- moves cannot have an amount written as a number.");
  expectError(() => {
    parseAlg("R2++").toString();
  }, "Pochmann ++ or -- moves cannot have an amount other than 1.");
});

test("parses Square-1 notation", () => {
  assert.strictEqual(
    parseAlg(
      "/ (-3,0) /  (0, 3)/ (0,-3)/ (0,3) / (2,0) / (0,2)/ (-2,0) / (4,0)  /  (0,-2) / (0, 2) / (-1,4) / (0, -3) / (0, 3)",
    ).toString(),

    "/ (-3, 0) / (0, 3) / (0, -3) / (0, 3) / (2, 0) / (0, 2) / (-2, 0) / (4, 0) / (0, -2) / (0, 2) / (-1, 4) / (0, -3) / (0, 3)",
  );
  assert.strictEqual(
    parseAlg("_SLASH_ (U_SQ_3' D_SQ_0) / (0, 3)").toString(),
    "/ (-3, 0) / (0, 3)",
  );
  expectError(() => {
    parseAlg("(3, 4) /(1, 2)").toString();
  }, "Unexpected character at index 8. Are you missing a space?");
});

test("does not allow caret NISS notation when disabled", async () => {
  try {
    setAlgDebug({ caretNISSNotationEnabled: false });
    await expectError(() => {
      parseAlg("R ^(U) D").toString();
    }, "Alg contained a caret but caret NISS notation is not enabled.");
  } finally {
    setAlgDebug({ caretNISSNotationEnabled: true });
  }
});
test("parses caret NISS notation by default", () => {
  assert(parseAlg("R ^(U L) D").isIdentical(new Alg("R . D (U L)'")));
});
