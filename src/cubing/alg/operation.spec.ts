import { Alg } from "./Alg";
import { experimentalAppendTurn } from "./operation";
import { Turn } from "./units";
import "./test/alg-comparison";

describe("operation", () => {
  it("can append turns", () => {
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("U2")),
    ).toBeIdentical(new Alg("R U R' U2"));
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("R", -2)),
    ).toBeIdentical(new Alg("R U R' R2'"));
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("R")),
    ).toBeIdentical(new Alg("R U R' R"));
  });

  it("can coalesce appended turns", () => {
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("U2"), {
        coalesce: true,
      }),
    ).toBeIdentical(new Alg("R U R' U2"));
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("R", -2), {
        coalesce: true,
      }),
    ).toBeIdentical(new Alg("R U R3'"));
    expect(
      experimentalAppendTurn(new Alg("R U R'"), new Turn("R"), {
        coalesce: true,
      }),
    ).toBeIdentical(new Alg("R U"));
  });

  it("can concat algs", () => {
    expect(new Alg("R U2").concat(new Alg("F' D"))).toBeIdentical(
      new Alg("R U2 F' D"),
    );
    expect(
      Array.from(new Alg("R U2").concat(new Alg("U R'")).units()).length,
    ).toBe(4);
    expect(new Alg("R U2").concat(new Alg("U R'"))).toBeIdentical(
      new Alg("R U2 U R'"),
    );
  });
});
