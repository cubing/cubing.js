
// TODO: would be nice if this could be `keyof typeof Puzzles`.
export type KPuzzleName = string;

// Should we avoid matching WCA names?
// Itgets awward for e.g. `171717` (rather than `17x17x17`).
const acnToKPuzzleNameMap: { [s: string]: KPuzzleName; } = {
  "3x3x3": "333",
  "2x2x2": "222",
};

// TODO: stricter key type.
const kPuzzleToAcnNameMap: { [s: string]: string } = {};
for (const [key, value] of Object.entries(acnToKPuzzleNameMap)) {
  kPuzzleToAcnNameMap[value] = key;
}

export function acnToKPuzzleName(s: string): KPuzzleName {
  return acnToKPuzzleNameMap[s] ?? s;
}

export function kPuzzleToAcnName(s: KPuzzleName): string {
  return kPuzzleToAcnNameMap[s] ?? s;
}
