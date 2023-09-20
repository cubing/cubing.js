import { expect, test } from "bun:test";

import { SimpleTwistyPropSource, TwistyPropDerived } from "./TwistyProp";

test("can set, get, and save prop values", async () => {
  class NumProp extends SimpleTwistyPropSource<number> {
    getDefaultValue() {
      return 4;
    }
  }
  class AddProp extends TwistyPropDerived<{ a: number; b: number }, number> {
    derive(inputs: { a: number; b: number }): number {
      return inputs.a + inputs.b;
    }
  }

  const a = new NumProp();
  const b = new NumProp(10);
  const sum = new AddProp({ a, b });

  expect(await sum.get()).toStrictEqual(14);

  // sum.addFreshListener((value: number) => {
  //   console.log(value);
  // });

  a.set(8);
  const savedSum = sum.get();
  a.set(10);
  expect(await savedSum).toStrictEqual(18);
  expect(await sum.get()).toStrictEqual(20);
});
