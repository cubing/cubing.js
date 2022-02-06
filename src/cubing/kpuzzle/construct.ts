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
    orientation: newOrientation,
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
  for (const [orbitName, orbitDefinition] of Object.entries(
    definition.orbits,
  )) {
    transformation[orbitName] = constructIdentityOrbitTransformation(
      orbitDefinition.numPieces,
    );
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
  const quantumKey = move.quantum.toString();
  let quantumMoveDefinition = kpuzzle.definition.moves[quantumKey] as
    | KTransformationData
    | undefined;

  if (!quantumMoveDefinition) {
    const derivedFrom =
      kpuzzle.definition.experimentalDerivedMoves?.[quantumKey];

    if (derivedFrom) {
      // TODO: avoid the round trip?
      quantumMoveDefinition =
        kpuzzle.algToTransformation(derivedFrom).transformationData;
    }
  }

  if (quantumMoveDefinition) {
    return repeatTransformationUncached(
      kpuzzle,
      quantumMoveDefinition,
      move.amount,
    );
  }

  // Handle e.g. `y2` if `y2` is defined.
  // Note: this doesn't handle multiples.
  const moveDefinition = kpuzzle.definition.moves[move.toString()];
  if (moveDefinition) {
    return moveDefinition;
  }

  // Handle e.g. `y2'` if `y2` is defined.
  // Note: this doesn't handle multiples.
  const inverseMoveDefinition =
    kpuzzle.definition.moves[move.invert().toString()];
  if (inverseMoveDefinition) {
    return repeatTransformationUncached(kpuzzle, inverseMoveDefinition, -1);
  }

  throw new Error(`Invalid move for KPuzzle (${kpuzzle.name()}): ${move}`);
}
