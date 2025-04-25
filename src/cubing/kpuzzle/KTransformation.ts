import type { Alg, Move } from "../alg";
import {
  invertTransformation,
  isTransformationDataIdentical,
  repeatTransformationUncached,
  transformationRepetitionOrder,
} from "./calculate";
import { combineTransformationData } from "./combine";
import { constructIdentityTransformationDataUncached } from "./construct";
import { KPattern } from "./KPattern";
import type { KPuzzle, KTransformationSource } from "./KPuzzle";
import type { KTransformationData } from "./KPuzzleDefinition";

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
  toKPattern(): KPattern {
    return KPattern.fromTransformation(this);
  }

  // TODO: support calculating this for a given start state. (For `R U R' U` on 3x3x3, should this default to 5 or 10?)
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
}
