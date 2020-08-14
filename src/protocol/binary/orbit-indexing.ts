export function identityPermutation(numElems: number): number[] {
  const arr = new Array(numElems);
  for (let i = 0; i < numElems; i++) {
    arr[i] = i;
  }
  return arr;
}

// Inclusive start, exclusive end (similar to `Array.prototype.slice`)
export function orientationRangeToMask(
  radix: number,
  orientation: number[],
  start: number,
  end: number,
): number {
  let val = 0;
  for (let i = start; i < end; i++) {
    val *= radix;
    val += orientation[i];
  }
  return val;
}

// Inclusive start, exclusive end (similar to `Array.prototype.slice`)
export function maskToOrientationRange(
  radix: number,
  numElems: number,
  mask: number,
): number[] {
  const arr = [];
  while (mask > 0) {
    arr.push(mask % radix);
    mask = Math.floor(mask / radix);
  }
  return new Array(numElems - arr.length).fill(0).concat(arr.reverse());
}

// From https://www.jaapsch.net/puzzles/compindx.htm#perm
export function permutationToLexIdx(permutation: number[]): number {
  const n = permutation.length;
  let lexIdx = 0;
  for (let i = 0; i < n - 1; i++) {
    lexIdx = lexIdx * (n - i);
    for (let j = i + 1; j < n; j++) {
      if (permutation[i] > permutation[j]) {
        lexIdx += 1;
      }
    }
  }
  return lexIdx;
}

// From https://www.jaapsch.net/puzzles/compindx.htm#perm
export function lexIdxToPermutation(
  numPieces: number,
  lexIdx: number,
): number[] {
  const permutation: number[] = new Array(numPieces);
  permutation[numPieces - 1] = 0;
  for (let i = numPieces - 2; i >= 0; i--) {
    permutation[i] = lexIdx % (numPieces - i);
    lexIdx = Math.floor(lexIdx / (numPieces - i));
    for (let j = i + 1; j < numPieces; j++) {
      if (permutation[j] >= permutation[i]) {
        permutation[j] = permutation[j] + 1;
      }
    }
  }
  return permutation;
}
