import { expect, test } from "bun:test";

import { Move } from "./Move";

test("can be modified", () => {
  expect(new Move("R").modified({ amount: 2 }).toString()).toStrictEqual("R2");
  expect(
    new Move("4r", 3)
      .modified({
        family: "u",
        outerLayer: 2,
      })
      .toString(),
  ).toStrictEqual("2-4u3");
});
