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

// Assumes `offset > 0`. Will produce invalid values if not!
// We don't check for that, since this can be a hot path.
export function mod(v: number, m: number, offset = 0): number {
  return (((v % m) + m + offset) % m) - offset;
}

export function modIntoRange(
  v: number,
  rangeMin: number,
  rangeMax: number,
): number {
  return mod(v - rangeMin, rangeMax - rangeMin) + rangeMin;
}
