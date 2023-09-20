import { expect, test } from "bun:test";

import { Alg } from "./Alg";
import { experimentalAlgCubingNetLink } from "./url";

test("experimentalAlgCubingNetLink to generate proper URLs", () => {
  expect(
    experimentalAlgCubingNetLink({ alg: Alg.fromString("R U R'") }),
  ).toStrictEqual("https://alg.cubing.net/?alg=R_U_R-");
});
