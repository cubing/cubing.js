import {
  KPuzzleDefinition,
  OrbitTransformation,
  Transformation,
} from "./definition_types";

export function combineTransformations(
  def: KPuzzleDefinition,
  t1: Transformation,
  t2: Transformation,
): Transformation {
  const newTrans: Transformation = {} as Transformation;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o1 = t1[orbitName];
    const o2 = t2[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      newOri[idx] =
        (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) %
        oDef.orientations;
      newPerm[idx] = o1.permutation[o2.permutation[idx]];
    }
    newTrans[orbitName] = { permutation: newPerm, orientation: newOri };
  }
  return newTrans;
}

export function multiplyTransformations(
  def: KPuzzleDefinition,
  t: Transformation,
  amount: number,
): Transformation {
  if (amount < 0) {
    return multiplyTransformations(def, invertTransformation(def, t), -amount);
  }
  if (amount === 0) {
    return identityTransformation(def);
  }
  if (amount === 1) {
    return t;
  }
  const halfish = multiplyTransformations(def, t, Math.floor(amount / 2));
  const twiceHalfish = combineTransformations(def, halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformations(def, t, twiceHalfish);
  }
}
export function identityTransformation(
  definition: KPuzzleDefinition,
): Transformation {
  const transformation = {} as Transformation;
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    const newPermutation = new Array(orbitDefinition.numPieces);
    const newOrientation = new Array(orbitDefinition.numPieces);
    for (let i = 0; i < orbitDefinition.numPieces; i++) {
      newPermutation[i] = i;
      newOrientation[i] = 0;
    }
    const orbitTransformation = {
      permutation: newPermutation,
      orientation: newOrientation,
    };
    transformation[orbitName] = orbitTransformation;
  }
  return transformation;
}

export function invertTransformation(
  def: KPuzzleDefinition,
  t: Transformation,
): Transformation {
  const newTrans: Transformation = {} as Transformation;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = t[orbitName];
    const newPerm = new Array(oDef.numPieces);
    const newOri = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      const fromIdx = o.permutation[idx] as number;
      newPerm[fromIdx] = idx;
      newOri[fromIdx] =
        (oDef.orientations - o.orientation[idx] + oDef.orientations) %
        oDef.orientations;
    }
    newTrans[orbitName] = { permutation: newPerm, orientation: newOri };
  }
  return newTrans;
}

function gcd(a: number, b: number): number {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}

/* calculate the order of a particular transformation. */
export function transformationOrder(
  def: KPuzzleDefinition,
  t: Transformation,
): number {
  let r: number = 1;
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    const o = t[orbitName];
    const d = new Array(oDef.numPieces);
    for (let idx = 0; idx < oDef.numPieces; idx++) {
      if (!d[idx]) {
        let w = idx;
        let om = 0;
        let pm = 0;
        for (;;) {
          d[w] = true;
          om = om + o.orientation[w];
          pm = pm + 1;
          w = o.permutation[w];
          if (w === idx) {
            break;
          }
        }
        if (om !== 0) {
          pm = (pm * oDef.orientations) / gcd(oDef.orientations, om);
        }
        r = (r * pm) / gcd(r, pm);
      }
    }
  }
  return r;
}

export function areOrbitTransformationsEquivalent(
  def: KPuzzleDefinition,
  orbitName: string,
  t1: Transformation,
  t2: Transformation,
  options: {
    ignoreOrientation?: boolean;
    ignorePermutation?: boolean;
  } = {},
): boolean {
  const oDef = def.orbits[orbitName];
  const o1 = t1[orbitName];
  const o2 = t2[orbitName];
  for (let idx = 0; idx < oDef.numPieces; idx++) {
    if (
      !options?.ignoreOrientation &&
      o1.orientation[idx] !== o2.orientation[idx]
    ) {
      return false;
    }
    if (
      !options?.ignorePermutation &&
      o1.permutation[idx] !== o2.permutation[idx]
    ) {
      return false;
    }
  }
  return true;
}

export function areTransformationsEquivalent(
  def: KPuzzleDefinition,
  t1: Transformation,
  t2: Transformation,
): boolean {
  for (const orbitName in def.orbits) {
    if (!areOrbitTransformationsEquivalent(def, orbitName, t1, t2)) {
      return false;
    }
  }
  return true;
}

export function areStatesEquivalient(
  def: KPuzzleDefinition,
  t1: Transformation,
  t2: Transformation,
): boolean {
  // Turn transformations into states.
  // This accounts for indistinguishable pieces.
  return areTransformationsEquivalent(
    def,
    combineTransformations(def, def.startPieces, t1),
    combineTransformations(def, def.startPieces, t2),
  );
}
