import type { Alg } from "../Alg";

expect.extend({
  toBeIdentical(expected: Alg, observed: Alg): jest.CustomMatcherResult {
    return {
      message: (): string => "Expected the same alg structure.",
      pass: expected?.isIdentical(observed),
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R, T> {
      toBeIdentical(observed: Alg): CustomMatcherResult;
    }
  }
}

// This is needed to modify the global namespace.
export {};
