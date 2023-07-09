import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
} from "../alg";
import { functionFromTraversal } from "../alg";
import type { KPuzzle } from "./KPuzzle";
import type { KPuzzleDefinition } from "./KPuzzleDefinition";
import { KTransformation, KTransformationOrbitView } from "./KTransformation";
import { combineTransformations } from "./combine";

export function isOrbitTransformationIdentityUncached(
  orbitView: KTransformationOrbitView,
): boolean {
  // TODO: optimize when `orbitView` has empty data.

  // TODO
  // if (o === lasto) {
  //   return true;
  // }
  const { numPieces } = orbitView.orbitDefinition;
  for (let idx = 0; idx < numPieces; idx++) {
    if (orbitView.getPermutationAt(idx) !== idx) {
      return false;
    }
  }
  if (orbitView.orbitDefinition.numOrientations > 1) {
    for (let idx = 0; idx < numPieces; idx++) {
      if (orbitView.getOrientationAt(idx) !== 0) {
        return false;
      }
    }
  }
  // lasto = o; // TODO
  return true;
}

export function isOrbitTransformationIdentical(
  orbitView1: KTransformationOrbitView,
  orbitView2: KTransformationOrbitView,
  options: {
    ignoreOrientation?: boolean;
    ignorePermutation?: boolean;
  } = {},
): boolean {
  for (let idx = 0; idx < orbitView1.orbitDefinition.numPieces; idx++) {
    if (
      !options?.ignoreOrientation &&
      orbitView1.getOrientationAt(idx) !== orbitView2.getOrientationAt(idx)
    ) {
      return false;
    }
    if (
      !options?.ignorePermutation &&
      orbitView1.getPermutationAt(idx) !== orbitView2.getPermutationAt(idx)
    ) {
      return false;
    }
  }
  return true;
}

export function isTransformationIdentical(
  transformation1: KTransformation,
  transformation2: KTransformation,
): boolean {
  for (const orbitName in transformation1.kpuzzle.definition.orbits) {
    if (
      !isOrbitTransformationIdentical(
        transformation1.orbitView(orbitName),
        transformation2.orbitView(orbitName),
      )
    ) {
      return false;
    }
  }
  return true;
}

export function invertTransformation(
  transformation: KTransformation,
): KTransformation {
  const inverseTransformation: KTransformation = new KTransformation(
    transformation.kpuzzle,
    {},
  );

  for (const orbitView of transformation.orbitViews()) {
    const { orbitDefinition } = orbitView;
    if (isOrbitTransformationIdentityUncached(orbitView)) {
      // leave empty!
    } else {
      const invserseOrbitView = inverseTransformation.orbitView(
        orbitView.orbitName,
      );
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          invserseOrbitView.setPermutationAt(
            orbitView.getPermutationAt(idx),
            idx,
          );
        }
      } else {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          const fromIdx = orbitView.getPermutationAt(idx);
          orbitView.setPermutationAt(fromIdx, idx);
          orbitView.setOrientationDeltaAt(
            fromIdx,
            -orbitView.getOrientationAt(idx),
          );
        }
      }
    }
  }
  return inverseTransformation;
}

export function repeatTransformationUncached(
  transformation: KTransformation,
  amount: number,
): KTransformation {
  // This is used for move construction, so we optimize for the quantum move case.
  if (amount === 1) {
    return transformation;
  }
  if (amount < 0) {
    return repeatTransformationUncached(
      invertTransformation(transformation),
      -amount,
    );
  }
  if (amount === 0) {
    // TODO
    return transformation.kpuzzle.identityTransformation();
  }
  let halfish = transformation;
  if (amount !== 2) {
    halfish = repeatTransformationUncached(
      transformation,
      Math.floor(amount / 2),
    );
  }
  const twiceHalfish = combineTransformations(halfish, halfish);
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformations(transformation, twiceHalfish);
  }
}

class AlgToTransformationTraversal extends TraversalDownUp<
  KPuzzle,
  KTransformation
> {
  traverseAlg(alg: Alg, kpuzzle: KPuzzle): KTransformation {
    let transformation: KTransformation | null = null;
    for (const algNode of alg.childAlgNodes()) {
      if (transformation) {
        transformation = transformation.applyTransformation(
          this.traverseAlgNode(algNode, kpuzzle),
        );
      } else {
        transformation = this.traverseAlgNode(algNode, kpuzzle);
      }
    }
    return transformation ?? kpuzzle.identityTransformation();
  }
  traverseGrouping(grouping: Grouping, kpuzzle: KPuzzle): KTransformation {
    const algTransformation = this.traverseAlg(grouping.alg, kpuzzle);
    return repeatTransformationUncached(algTransformation, grouping.amount);
  }
  traverseMove(move: Move, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.moveToTransformation(move);
  }
  traverseCommutator(
    commutator: Commutator,
    kpuzzle: KPuzzle,
  ): KTransformation {
    const aTransformation = this.traverseAlg(commutator.A, kpuzzle);
    const bTransformation = this.traverseAlg(commutator.B, kpuzzle);
    return aTransformation
      .applyTransformation(bTransformation)
      .applyTransformation(aTransformation.invert())
      .applyTransformation(bTransformation.invert());
  }
  traverseConjugate(conjugate: Conjugate, kpuzzle: KPuzzle): KTransformation {
    const aTransformation = this.traverseAlg(conjugate.A, kpuzzle);
    const bTransformation = this.traverseAlg(conjugate.B, kpuzzle);
    return aTransformation
      .applyTransformation(bTransformation)
      .applyTransformation(aTransformation.invert());
  }
  traversePause(_: Pause, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
  traverseNewline(_: Newline, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
  traverseLineComment(_: LineComment, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
}

export const algToTransformation = functionFromTraversal(
  AlgToTransformationTraversal,
);

export function canConvertStateToUniqueTransformationUncached(
  definition: KPuzzleDefinition,
): boolean {
  for (const [orbitName, orbitDefinition] of Object.entries(definition)) {
    const pieces = new Array(orbitDefinition.numPieces).fill(false);
    for (const piece of this.definition.startStateData[orbitName].pieces) {
      pieces[piece] = true;
    }
    for (const piece of pieces) {
      if (!piece) {
        return false;
      }
    }
  }
  return true;
}

function gcd(a: number, b: number): number {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}

/* calculate the order of a particular transformation. */
export function transformationRepetitionOrder(
  transformation: KTransformation,
): number {
  let order: number = 1;
  for (const orbitView of transformation.orbitViews()) {
    const { orbitDefinition } = orbitView;
    const orbitPieces = new Array(orbitDefinition.numPieces);
    for (let startIdx = 0; startIdx < orbitDefinition.numPieces; startIdx++) {
      if (!orbitPieces[startIdx]) {
        let currentIdx = startIdx;
        let orientationSum = 0;
        let cycleLength = 0;
        for (;;) {
          orbitPieces[currentIdx] = true;
          orientationSum =
            orientationSum + orbitView.getOrientationAt(currentIdx);
          cycleLength = cycleLength + 1;
          currentIdx = orbitView.getPermutationAt(currentIdx);
          if (currentIdx === startIdx) {
            break;
          }
        }
        if (orientationSum !== 0) {
          cycleLength =
            (cycleLength * orbitDefinition.numOrientations) /
            gcd(orbitDefinition.numOrientations, Math.abs(orientationSum));
        }
        order = (order * cycleLength) / gcd(order, cycleLength);
      }
    }
  }
  return order;
}
