const {
  expect: untypedExpect,
  use: untypedUse,
  Assertion: untypedAssertion,
  // @ts-ignore: Top-level await is okay because this is not part of the main library.
} = await import("@esm-bundle" + "/chai");
export const expect: typeof import("chai").expect = untypedExpect;
export const use: typeof import("chai").use = untypedUse;
export const Assertion: typeof import("chai").Assertion = untypedAssertion;
