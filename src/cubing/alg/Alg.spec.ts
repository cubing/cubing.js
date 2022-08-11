const { expect: untypedExpect } = await import("@esm-bundle/chai");
const expect: typeof import("chai").expect = untypedExpect;

import { Alg } from "./Alg";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toString()).to.equal("R U R'");
  });
});
