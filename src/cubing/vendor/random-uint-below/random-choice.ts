import { randomUIntBelow } from "./random53BitValue";

// Inspired by https://reference.wolfram.com/language/ref/RandomChoice.html
// This library itself should be kept small, but a wrapper library may want to implement selecting multiple element without replacement as with replacement:
// https://reference.wolfram.com/language/ref/RandomSample.html
export function randomChoice<T>(arr: T[]): T {
  return arr[randomUIntBelow(arr.length)];
}

export async function randomPermuteInPlace<T>(list: T[]): Promise<void> {
  for (let i = 1; i < list.length; i++) {
    const j = randomUIntBelow(i);
    [list[i], list[j]] = [list[j], list[i]];
  }
}
