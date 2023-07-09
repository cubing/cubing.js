import { KState } from ".";
import type { Alg, Move } from "../alg";
import {
  invertTransformation,
  isTransformationDataIdentical,
  repeatTransformationUncached,
  transformationRepetitionOrder,
} from "./calculate";
import { combineTransformationData } from "./combine";
import { constructIdentityTransformationDataUncached } from "./construct";
import type { KPuzzle, KTransformationSource } from "./KPuzzle";
import type {
  KPuzzleOrbitDefinition,
  KTransformationData,
  KTransformationOrbitData,
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
    return new KTransformation(
      this.kpuzzle,
      invertTransformation(this.kpuzzle, this.transformationData),
    );
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
    const transformation = new KTransformation(
      kpuzzle,
      constructIdentityTransformationDataUncached(kpuzzle.definition),
    );
    transformation.#cachedIsIdentity = true;
    return transformation;
  }

  isIdentical(t2: KTransformation): boolean {
    return isTransformationDataIdentical(
      this.kpuzzle,
      this.transformationData,
      t2.transformationData,
    );
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

    return new KTransformation(
      this.kpuzzle,
      combineTransformationData(
        this.kpuzzle.definition,
        this.transformationData,
        t2.transformationData,
      ),
    );
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
    return new KTransformation(
      this.kpuzzle,
      repeatTransformationUncached(
        this.kpuzzle,
        this.transformationData,
        amount,
      ),
    );
  }

  public orbitView(orbitName: string): KTransformationOrbitView {
    const orbitDef = this.kpuzzle.definition.orbits[orbitName];
    if (!orbitDef) {
      throw "Invalid orbit name for KTransformation.";
    }
    return new KTransformationOrbitView(
      orbitDef,
      this.transformationData,
      orbitName,
    );
  }

  public *orbitViews(): Generator<KTransformationOrbitView> {
    for (const orbitName in this.kpuzzle.definition.orbits) {
      yield this.orbitView(orbitName);
    }
  }
}

// TODO: Combine some of the implementation with `KStateOrbitView`?
export class KTransformationOrbitView {
  #orbitDef: KPuzzleOrbitDefinition;
  #transformationData: KTransformationData;
  #orbitName: string;
  constructor(
    orbitDef: KPuzzleOrbitDefinition,
    transformation: KTransformationData,
    orbitName: string,
  ) {
    if (!(orbitName in orbitDef)) {
      throw "Invalid orbit name for KTransformation.";
    }
    this.#orbitDef = orbitDef;
    this.#transformationData = transformation;
    this.#orbitName = orbitName;
  }

  getDefinition(): KPuzzleOrbitDefinition {
    return this.#orbitDef;
  }

  #orbit(): KTransformationOrbitData | undefined {
    return this.#transformationData[this.#orbitName];
  }

  #ensureOrbit(): KTransformationOrbitData {
    return (this.#transformationData[this.#orbitName] ??= {});
  }

  #ensureOrbitPermutation(): (number | undefined)[] {
    return (this.#ensureOrbit().permutation ??= []);
  }

  #ensureOrbitOrientation(): (number | undefined)[] {
    return (this.#ensureOrbit().orientation ??= []);
  }

  getPermutation(index: number): number {
    return this.#orbit()?.permutation?.[index] ?? index;
  }

  // TODO: prevent write by default.
  setPermutation(index: number, value: number) {
    this.#ensureOrbitPermutation()[index] = value;
  }

  getOrientation(index: number): number {
    return this.#orbit()?.orientation?.[index] ?? index;
  }

  // TODO: prevent write by default.
  setOrientation(index: number, value: number) {
    this.#ensureOrbitOrientation()[index] = value;
  }
}
