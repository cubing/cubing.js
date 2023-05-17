import { offsetMod } from "../../alg/cubing-private";

export function arrayEquals<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function arrayEqualsCompare<T>(
  a: readonly T[],
  b: readonly T[],
  compare: (a: T, b: T) => boolean,
): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (!compare(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function modIntoRange(
  v: number,
  rangeMin: number,
  rangeMax: number,
): number {
  return offsetMod(v, rangeMax - rangeMin, rangeMin);
}
