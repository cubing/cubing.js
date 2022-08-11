import { expect } from "../../test/chai-workaround";
import { Alg } from "./Alg";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toString()).to.equal("R U R'");
  });
});
