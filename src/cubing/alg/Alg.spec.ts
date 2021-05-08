import { Alg } from "./Alg";
import "./test/alg-comparison";

describe("operation", () => {
  it("can be constructed from a string", () => {
    expect(new Alg("R U R'").toString()).toEqual("R U R'");

    // expect(Array.from(new Alg("R U R'").units)).toHaveLength(3);
  });
});

describe("Clock", () => {
  it("parses notation", () => {
    expect(
      new Alg(
        "  UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+  ALL5+ UL",
      ).toString(),
    ).toEqual(
      "UR4+ DR4+ DL1+ UL3- U1+ R2- D5+ L6+ ALL4- y2 U3- R5- D4+ L6+ ALL5+ UL",
    );
    expect(new Alg("UR_PLUS_4 D_PLUS_3' U1+").toString()).toEqual(
      "UR4+ D3- U1+",
    );
    expect(() => new Alg("UR+").toString()).toThrow(
      "Clock dial moves must have an amount written as a natural number followed by + or -.",
    );
    expect(() => new Alg("UR+2").toString()).toThrow(
      "Clock dial moves must have an amount written as a natural number followed by + or -.",
    );
    expect(() => new Alg("UR1+2").toString()).toThrow(
      "Unexpected character at index 4. Are you missing a space?",
    ); // TODO: Better message
  });
});

describe("Megaminx", () => {
  it("parses notation", () => {
    expect(new Alg(" R++  D-- U'  \n  R++ D++ U").toString()).toEqual(
      "R++ D-- U'\nR++ D++ U",
    );
    expect(new Alg("R_PLUSPLUS_ D_PLUSPLUS_'").toString()).toEqual("R++ D--");
    expect(() => new Alg("R1++").toString()).toThrow(
      "Pochmann ++ or -- moves cannot have an amount written as a number.",
    );
    expect(() => new Alg("R2++").toString()).toThrow(
      "Pochmann ++ or -- moves cannot have an amount other than 1.",
    );
  });
});

describe("Square-1", () => {
  it("parses notation", () => {
    expect(
      new Alg(
        "/ (-3,0) /  (0, 3)/ (0,-3)/ (0,3) / (2,0) / (0,2)/ (-2,0) / (4,0)  /  (0,-2) / (0, 2) / (-1,4) / (0, -3) / (0, 3)",
      ).toString(),
    ).toEqual(
      "/ (-3, 0) / (0, 3) / (0, -3) / (0, 3) / (2, 0) / (0, 2) / (-2, 0) / (4, 0) / (0, -2) / (0, 2) / (-1, 4) / (0, -3) / (0, 3)",
    );
    expect(new Alg("_SLASH_ (U_SQ_3' D_SQ_0) / (0, 3)").toString()).toEqual(
      "/ (-3, 0) / (0, 3)",
    );
    expect(() => new Alg("(3, 4) /(1, 2)").toString()).toThrow(
      "Unexpected character at index 8. Are you missing a space?",
    );
  });
});
