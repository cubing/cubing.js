import { expect, test } from "bun:test";
import { Alg, Grouping } from "../..";

test("Grouping can invert a Square-1 tuple", () => {
  expect(new Alg("(5, 4)").invert().toString()).toStrictEqual("(-5, -4)");
});
test("Grouping doesn't crash for a Square-1 tuple with a non-1 amount", () => {
  const alg = new Alg("(5, 4)");
  const grouping = alg.childAlgNodes().next().value;
  expect(new Grouping(grouping.alg, -1).toString()).toStrictEqual(
    "(U_SQ_5 D_SQ_4)'",
  );
  expect(new Grouping(grouping.alg, 2).toString()).toStrictEqual(
    "(U_SQ_5 D_SQ_4)2",
  );
  expect(new Grouping(grouping.alg, -7).toString()).toStrictEqual(
    "(U_SQ_5 D_SQ_4)7'",
  );
});
test("Grouping collapses conjugates and commutators", () => {
  expect(new Alg("([R, F])2").toString()).toStrictEqual("[R, F]2");
  expect(new Alg("([R: F])2").toString()).toStrictEqual("[R: F]2");
  expect(new Alg("([R: F] U)2").toString()).toStrictEqual("([R: F] U)2");
});
