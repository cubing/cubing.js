export function arrayEquals(a: readonly any[], b: readonly any[]): boolean {
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
