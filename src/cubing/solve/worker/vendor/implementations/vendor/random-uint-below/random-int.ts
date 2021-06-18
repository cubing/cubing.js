import {
  getRandomValuesFactory,
  GetRandomValuesFunction,
} from "./get-random-values";

/*
 * randomInt.below(max) returns a random non-negative integer less than max (0 <= output < max).
 * `max` must be at most 2^53.
 */

var MAX_JS_PRECISE_INT = 9007199254740992;

var UPPER_HALF_MULTIPLIER = 2097152; // 2^21. We have to use multiplication because bit shifts truncate to 32 bits.
var LOWER_HALF_DIVIDER = 2048;

function random53BitValue(getRandomValues: GetRandomValuesFunction): number {
  // Construct a random 53-bit value from a 32-bit upper half and a 21-bit lower half.
  var arr = new Uint32Array(2);
  getRandomValues(arr);
  var upper = arr[0];
  var lower = arr[1];
  return (
    Math.floor(upper * UPPER_HALF_MULTIPLIER) +
    Math.floor(lower / LOWER_HALF_DIVIDER)
  );
}

function validateMax(max: number): void {
  if (typeof max !== "number" || max < 0 || Math.floor(max) !== max) {
    throw new Error(
      "randomInt.below() not called with a positive integer value."
    );
  }
  if (max > MAX_JS_PRECISE_INT) {
    throw new Error(
      "Called randomInt.below() with max == " +
        max +
        ", which is larger than Javascript can handle with integer precision."
    );
  }
}

// TODO: cache generated `randomUIntBelow`?
export async function randomUIntBelowFactory(): Promise<
  (max: number) => number
> {
  const getRandomValues = await getRandomValuesFactory();
  const randomUIntBelow = (max: number): number => {
    validateMax(max);

    var val = random53BitValue(getRandomValues);
    var maxUniformSamplingRange = Math.floor(MAX_JS_PRECISE_INT / max) * max;

    // Rejection sampling:
    if (val < maxUniformSamplingRange) {
      return val % max;
    } else {
      // val % max would produce a biased result. This bias an be very bad if `max` is on the order of MAX_JS_PRECISE_INT. We have to try again, so just call ourselves recursively.
      // For some values of `max` just above 9007199254740992 / 2, this happens about once on average. For other values of `max`, it's less than that (and for small values of `max` it's extremely unlikely).

      // TODO: Use more bits of accuracy instead of rejection sampling to avoid DoS.
      return randomUIntBelow(max);
    }
  };
  return randomUIntBelow;
}
