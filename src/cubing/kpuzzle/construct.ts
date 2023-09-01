import type { Move } from "../alg";
import { repeatTransformationUncached } from "./calculate";
import type { KPuzzle } from "./KPuzzle";
import type {
  KPuzzleDefinition,
  KTransformationData,
  KTransformationOrbitData,
} from "./KPuzzleDefinition";

const FREEZE: boolean = false;

const identityOrbitCache = new Map<number, KTransformationOrbitData>();
function constructIdentityOrbitTransformation(
  numPieces: number,
): KTransformationOrbitData {
  const cached = identityOrbitCache.get(numPieces);
  if (cached) {
    return cached;
  }

  const newPermutation = new Array(numPieces);
  const newOrientation = new Array(numPieces);
  for (let i = 0; i < numPieces; i++) {
    newPermutation[i] = i;
    newOrientation[i] = 0;
  }
  const orbitTransformation = {
    permutation: newPermutation,
    orientationDelta: newOrientation,
  };
  if (FREEZE) {
    Object.freeze(newPermutation); // TODO
    Object.freeze(newOrientation); // TODO
    Object.freeze(orbitTransformation); // TODO
  }
  identityOrbitCache.set(numPieces, orbitTransformation);
  return orbitTransformation;
}

export function constructIdentityTransformationDataUncached(
  definition: KPuzzleDefinition,
): KTransformationData {
  const transformation = {} as KTransformationData;
  for (const orbitDefinition of definition.orbits) {
    transformation[orbitDefinition.orbitName] =
      constructIdentityOrbitTransformation(orbitDefinition.numPieces);
  }
  if (FREEZE) {
    Object.freeze(transformation); // TODO
  }
  return transformation;
}

export function moveToTransformationUncached(
  kpuzzle: KPuzzle,
  move: Move,
): KTransformationData {
  function getTransformationData(
    key: {
      toString: () => string;
    },
    multiplyAmount: number,
  ): KTransformationData | undefined {
    const s = key.toString();
    const movesDef = kpuzzle.definition.moves[s];
    if (movesDef) {
      return repeatTransformationUncached(kpuzzle, movesDef, multiplyAmount);
    }
    const derivedDef = kpuzzle.definition.derivedMoves?.[s];
    if (derivedDef) {
      return repeatTransformationUncached(
        kpuzzle,
        kpuzzle.algToTransformation(derivedDef).transformationData,
        multiplyAmount,
      );
    }
    return undefined;
  }

  // TODO: Use Euclid's algorithm to pre-calculate the GCD of moves for each
  // quantum, along with its transformation. This will make lookup `O(1)` for multiples of e.g. `y2`.

  const data =
    getTransformationData(move.quantum, move.amount) ??
    // Handle e.g. `y2` if `y2` is defined.
    // Note: this doesn't handle multiples.
    getTransformationData(move, 1) ??
    // Handle e.g. `y2'` if `y2` is defined.
    // Note: this doesn't handle multiples.
    getTransformationData(move.invert, -1);

  if (data) {
    return data;
  }
  throw new Error(`Invalid move for KPuzzle (${kpuzzle.name()}): ${move}`);
}
