import { Alg } from "./Alg";
import "./test/alg-comparison";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toString()).toEqual("R U R'");
  });
});
