import { Alg } from "./Alg";
import "./test/structure-equals";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toString()).toEqual("R U R'");

    // expect(Array.from(new Alg("R U R'").units)).toHaveLength(3);
  });
});
