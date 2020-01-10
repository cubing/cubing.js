import { Sequence } from "../algorithm";
import { structureEquals } from "../traversal";

expect.extend({
  toStructureEqual(expected: Sequence, observed: Sequence): jest.CustomMatcherResult {
    return {
      message: () => "Expected the same alg structure.",
      pass: structureEquals(expected, observed),
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toStructureEqual(observed: Sequence): CustomMatcherResult;
    }
  }
}

// This is needed to modify the global namespace.
export { };
