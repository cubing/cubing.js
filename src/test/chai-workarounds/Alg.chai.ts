/**
 * Ideally, we'd include this file from each individual test file as needed.
 * However:
 *
 * - The `declare global` type is picked up by files even when not directly
 *   imported, which is not intuitive.
 * - The export implementation and types for `chai` make it difficult (or even
 *   impossible) to define the augmentation another way. In particular, `declare
 *   module "chai"` results in "Cannot augment module 'chai' because it resolves
 *   to a non-module entity. ts(2671)".
 *
 * So instead we import this in all tests, for now.
 */

import { Alg, experimentalEnsureAlg } from "../../cubing/alg/Alg";
import { Assertion, expect } from "./chai";

Assertion.addMethod("identicalAlg", function (expected: Alg | string): void {
  expect(this._obj).to.be.instanceOf(Alg);
  const expectedAlg = experimentalEnsureAlg(expected);

  // new Assertion(this._obj.isIdentical(expectedAlg)).to.be.true;
  this.assert(
    this._obj.isIdentical(expectedAlg),
    "expected alg to match",
    "expected alg not to match",
    this._obj.toString(), // expected
    expectedAlg.toString(), // actual
  );
});

declare global {
  // Ideally we'd avoid using a namespace. It has several confusing properties,
  // like automatically being available in all tests without imports (which can
  // be confusing and throw off tools). But we're doing this for now because
  // it's what works.

  export namespace Chai {
    interface Assertion {
      identicalAlg(expected: Alg | string): Promise<void>;
    }
  }
}
