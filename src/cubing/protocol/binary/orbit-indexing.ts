import {
  getOriAtIndex,
  getPermOrPieceAtIndex,
} from "../../kpuzzle/cubing-private";

export function identityPermutation(numElems: number): number[] {
  const arr = new Array<number>(numElems);
  for (let i = 0; i < numElems; i++) {
    arr[i] = i;
  }
  return arr;
}

// Inclusive start, exclusive end (similar to `Array.prototype.slice`)
export function orientationsToMask(
  numElems: number,
  radix: number,
  orientations?: number[],
): number {
  let val = 0;
  for (let i = 0; i < numElems; i++) {
    val *= radix;
    val += getOriAtIndex(i, orientations);
  }
  return val;
}

// Inclusive start, exclusive end (similar to `Array.prototype.slice`)
export function maskToOrientations(
  radix: number,
  numElems: number,
  mask: number,
): number[] {
  const arr = [];
  while (mask > 0) {
    arr.push(mask % radix);
    mask = Math.floor(mask / radix);
  }
  return new Array<number>(numElems - arr.length).fill(0).concat(arr.reverse());
}

// From https://www.jaapsch.net/puzzles/compindx.htm#perm
export function permutationToLex(
  numPieces: number,
  permutation?: number[],
): number {
  let lexicographicIdx = 0;
  for (let i = 0; i < numPieces - 1; i++) {
    lexicographicIdx = lexicographicIdx * (numPieces - i);
    for (let j = i + 1; j < numPieces; j++) {
      if (
        getPermOrPieceAtIndex(i, permutation) >
        getPermOrPieceAtIndex(j, permutation)
      ) {
        lexicographicIdx += 1;
      }
    }
  }
  return lexicographicIdx;
}

// From https://www.jaapsch.net/puzzles/compindx.htm#perm
export function lexToPermutation(
  numPieces: number,
  lexicographicIdx: number,
): number[] {
  const permutation: number[] = new Array(numPieces);
  permutation[numPieces - 1] = 0;
  for (let i = numPieces - 2; i >= 0; i--) {
    permutation[i] = lexicographicIdx % (numPieces - i);
    lexicographicIdx = Math.floor(lexicographicIdx / (numPieces - i));
    for (let j = i + 1; j < numPieces; j++) {
      if (permutation[j] >= permutation[i]) {
        permutation[j] = permutation[j] + 1;
      }
    }
  }
  return permutation;
}
