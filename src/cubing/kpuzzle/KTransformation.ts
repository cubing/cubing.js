import { KState } from ".";
import type { Alg, Move } from "../alg";
import { offsetMod } from "../alg/cubing-private";
import {
  invertTransformation,
  isTransformationDataIdentical,
  repeatTransformationUncached,
  transformationRepetitionOrder,
} from "./calculate";
import { combineTransformations } from "./combine";
import type { KPuzzle, KTransformationSource } from "./KPuzzle";
import type {
  KPuzzleOrbitDefinition,
  KTransformationData,
  KTransformationOrbitData,
  OrbitName,
} from "./KPuzzleDefinition";

export class KTransformation {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly transformationData: KTransformationData,
  ) {}

  toJSON(): any {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      transformationData: this.transformationData,
    };
  }

  invert(): KTransformation {
    return invertTransformation(this);
  }

  // For optimizations, we want to make it cheap to rely on optimizations when a
  // transformation is an identity. Here, we try to make it cheaper by:
  // - only calculating when needed, and
  // - caching the result.
  #cachedIsIdentity: boolean | undefined; // TODO: is `null` worse here?
  isIdentityTransformation(): boolean {
    return (this.#cachedIsIdentity ??= this.isIdentical(
      this.kpuzzle.identityTransformation(),
    ));
  }

  /** @deprecated */
  static experimentalConstructIdentity(kpuzzle: KPuzzle) {
    const transformation = new KTransformation(kpuzzle, {});
    transformation.#cachedIsIdentity = true;
    return transformation;
  }

  isIdentical(t2: KTransformation): boolean {
    return isTransformationDataIdentical(this, t2);
  }

  // Convenience function
  /** @deprecated */
  apply(source: KTransformationSource): KTransformation {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }

  applyTransformation(t2: KTransformation): KTransformation {
    if (this.kpuzzle !== t2.kpuzzle) {
      throw new Error(
        `Tried to apply a transformation for a KPuzzle (${t2.kpuzzle.name()}) to a different KPuzzle (${this.kpuzzle.name()}).`,
      );
    }

    if (this.#cachedIsIdentity) {
      return new KTransformation(this.kpuzzle, t2.transformationData);
    }
    if (t2.#cachedIsIdentity) {
      return new KTransformation(this.kpuzzle, this.transformationData);
    }

    return new KTransformation(this.kpuzzle, combineTransformations(this, t2));
  }

  applyMove(move: Move | string): KTransformation {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }

  applyAlg(alg: Alg | string): KTransformation {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }

  // Convenience. Useful for chaining.
  toKState(): KState {
    return KState.fromTransformation(this);
  }

  repetitionOrder(): number {
    return transformationRepetitionOrder(this.kpuzzle.definition, this);
  }

  selfMultiply(amount: number): KTransformation {
    return repeatTransformationUncached(this, amount);
  }

  public orbitView(
    orbitName: string,
    mutable: boolean = false,
  ): KTransformationOrbitView {
    const orbitDef = this.kpuzzle.definition.orbits[orbitName];
    if (!orbitDef) {
      throw "Invalid orbit name for KTransformation.";
    }
    return new KTransformationOrbitView(
      orbitDef,
      this.transformationData,
      orbitName,
      mutable,
    );
  }

  public *orbitViews(
    mutable: boolean = false,
  ): Generator<KTransformationOrbitView> {
    for (const orbitName in this.kpuzzle.definition.orbits) {
      yield this.orbitView(orbitName, mutable);
    }
  }
}

// TODO: Combine some of the implementation with `KStateOrbitView`?
export class KTransformationOrbitView {
  #transformationData: KTransformationData;
  constructor(
    public readonly orbitDefinition: KPuzzleOrbitDefinition,
    transformationData: KTransformationData,
    public readonly orbitName: OrbitName,
    public readonly mutable: boolean,
  ) {
    this.#transformationData = transformationData;
  }

  #orbit(): KTransformationOrbitData | undefined {
    return this.#transformationData[this.orbitName];
  }

  #ensureOrbit(): KTransformationOrbitData {
    return (this.#transformationData[this.orbitName] ??= {});
  }

  #ensureOrbitPermutation(): (number | undefined)[] {
    return (this.#ensureOrbit().permutation ??= []);
  }

  #ensureOrbitOrientation(): (number | undefined)[] {
    return (this.#ensureOrbit().orientation ??= []);
  }

  getPermutationAt(index: number): number {
    return this.#orbit()?.permutation?.[index] ?? index;
  }

  setPermutationAt(index: number, value: number) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set permutation for a non-mutable `KTransformationOrbitView`.",
      );
    }
    this.#ensureOrbitPermutation()[index] = value;
  }

  *getPermutation(): Generator<number> {
    const numPieces = this.orbitDefinition.numPieces;
    for (let i = 0; i < numPieces; i++) {
      yield this.getPermutationAt(i);
    }
  }

  getPermutationRaw(): (number | undefined)[] | undefined {
    return this.#orbit()?.permutation;
  }

  setPermutationRaw(permutation: (number | undefined)[] | undefined) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set permutation for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbit().permutation = permutation;
  }

  getOrientationAt(index: number): number {
    return this.#orbit()?.orientation?.[index] ?? index;
  }

  // Automatically mods `value` into the appropriate range.
  setOrientationAt(index: number, value: number) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set piece for a non-mutable `KTransformationOrbitView`.",
      );
    }
    this.#ensureOrbitOrientation()[index] = offsetMod(
      value,
      this.orbitDefinition.numOrientations,
    );
  }

  // `delta` may be negative.
  // Automatically mods `value` into the appropriate range.
  setOrientationDeltaAt(idx: number, delta: number) {
    this.setOrientationAt(idx, this.getOrientationAt(idx) + delta);
  }

  *getOrientation(): Generator<number> {
    const numPieces = this.orbitDefinition.numPieces;
    for (let i = 0; i < numPieces; i++) {
      yield this.getOrientationAt(i);
    }
  }

  getOrientationRaw(): (number | undefined)[] | undefined {
    return this.#orbit()?.orientation;
  }

  setOrientationRaw(orientation: (number | undefined)[] | undefined) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set orientations for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbit().orientation = orientation;
  }

  // Set permutation and orientation from another orbit view.
  setFrom(otherOrbitView: KTransformationOrbitView) {
    if (!this.mutable) {
      throw new Error("Tried to set from a non-mutable `KStateOrbitView`.");
    }
    this.setPermutationRaw(otherOrbitView.getPermutationRaw());
    this.setOrientationRaw(otherOrbitView.getOrientationRaw());
  }
}
