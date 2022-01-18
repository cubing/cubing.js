import type { KPuzzle } from "./KPuzzle";
import type {
  KOrbitTransformationData,
  KTransformationData,
} from "./KPuzzleDefinition";

function isOrbitTransformationIdentity(
  numOrientations: number,
  o: KOrbitTransformationData,
): boolean {
  // TODO
  // if (o === lasto) {
  //   return true;
  // }
  const perm = o.permutation;
  const n = perm.length;
  for (let idx = 0; idx < n; idx++) {
    if (perm[idx] !== idx) {
      return false;
    }
  }
  if (numOrientations > 1) {
    const ori = o.orientation;
    for (let idx = 0; idx < n; idx++) {
      if (ori[idx] !== 0) {
        return false;
      }
    }
  }
  // lasto = o; // TODO
  return true;
}

export class KTransformation {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly data: KTransformationData,
  ) {}

  // @deprecated
  isIdentity(): boolean {
    return false; // TODO
  }

  applyTransformation(t2: KTransformation): KTransformation {
    const newTransformationData = {} as KTransformationData;
    const def = this.kpuzzle.definition;
    for (const orbitName in def.orbits) {
      const orbitDefinition = def.orbits[orbitName];
      const o1 = this.data[orbitName];
      const o2 = t2.data[orbitName];
      if (isOrbitTransformationIdentity(orbitDefinition.orientations, o2)) {
        // common case for big cubes
        newTransformationData[orbitName] = o1;
      } else if (
        isOrbitTransformationIdentity(orbitDefinition.orientations, o1)
      ) {
        newTransformationData[orbitName] = o2;
      } else {
        const newPerm = new Array(orbitDefinition.numPieces);
        if (orbitDefinition.orientations === 1) {
          for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
            newPerm[idx] = o1.permutation[o2.permutation[idx]];
          }
          newTransformationData[orbitName] = {
            permutation: newPerm,
            orientation: o1.orientation,
          };
        } else {
          const newOri = new Array(orbitDefinition.numPieces);
          for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
            newOri[idx] =
              (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) %
              orbitDefinition.orientations;
            newPerm[idx] = o1.permutation[o2.permutation[idx]];
          }
          newTransformationData[orbitName] = {
            permutation: newPerm,
            orientation: newOri,
          };
        }
      }
    }
    return new KTransformation(this.kpuzzle, newTransformationData);
  }
}
