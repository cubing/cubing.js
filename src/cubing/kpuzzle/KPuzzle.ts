import type {
  KOrbitTransformationData,
  KPuzzleDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";

const FREEZE: boolean = false;

const identityOrbitCache = new Map<number, KOrbitTransformationData>();
function constructIdentityOrbitTransformation(
  numPieces: number,
): KOrbitTransformationData {
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

function constructTransformationData(
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

export class KPuzzle {
  constructor(public readonly definition: KPuzzleDefinition) {}

  #cachedIdentityTransformationData: KTransformationData | null = null;
  identityTransformation(): KTransformation {
    return new KTransformation(
      this,
      (this.#cachedIdentityTransformationData ??= constructTransformationData(
        this.definition,
      )),
    );
  }
}
