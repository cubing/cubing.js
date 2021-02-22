import { Alg } from "./Alg";
import { algCubingNetLink } from "./url";

describe("algCubingNetLink", () => {
  it("algCubingNetLink to generate proper URLs", () => {
    expect(algCubingNetLink({ alg: Alg.fromString("R U R'") })).toEqual(
      "https://alg.cubing.net/?alg=R_U_R-",
    );
  });
});
