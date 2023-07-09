import type { KTransformationOrbitView } from "../../kpuzzle/KTransformation";

export function identityPermutation(numElems: number): number[] {
  const arr = new Array<number>(numElems);
  for (let i = 0; i < numElems; i++) {
    arr[i] = i;
  }
  return arr;
}

// Inclusive start, exclusive end (similar to `Array.prototype.slice`)
export function orientationsToMask(
  orbitView: KTransformationOrbitView,
): number {
  let val = 0;
  const { orbitDefinition } = orbitView;
  for (let i = 0; i < orbitDefinition.numPieces; i++) {
    val *= orbitDefinition.numOrientations;
    val += orbitView.getOrientation(i);
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
export function permutationToLex(orbitView: KTransformationOrbitView): number {
  const numPieces = orbitView.orbitDefinition.numPieces;
  let lexicographicIdx = 0;
  for (let i = 0; i < numPieces - 1; i++) {
    lexicographicIdx = lexicographicIdx * (numPieces - i);
    for (let j = i + 1; j < numPieces; j++) {
      if (orbitView.getPermutation(i) > orbitView.getPermutation(j)) {
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
