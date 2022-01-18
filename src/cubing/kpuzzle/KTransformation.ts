import type { Alg, Move } from "../alg";
import {
  invertTransformation,
  isTransformationDataIdentical,
} from "./calculate";
import { combineTransformationData } from "./combine";
import type { KPuzzle } from "./KPuzzle";
import type { KTransformationData } from "./KPuzzleDefinition";
import { KState } from "./KState";

export class KTransformation {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly transformationData: KTransformationData,
  ) {}

  invert(): KTransformation {
    return new KTransformation(
      this.kpuzzle,
      invertTransformation(this.kpuzzle, this.transformationData),
    );
  }

  // @deprecated
  #cachedIsIdentity: boolean | undefined; // TODO: is `null` worse here?
  isIdentityTransformation(): boolean {
    return (this.#cachedIsIdentity ??= this.isIdentical(
      this.kpuzzle.identityTransformation(),
    ));
  }

  isIdentical(t2: KTransformation): boolean {
    return isTransformationDataIdentical(
      this.kpuzzle,
      this.transformationData,
      t2.transformationData,
    );
  }

  applyTransformation(t2: KTransformation): KTransformation {
    if (this.kpuzzle !== t2.kpuzzle) {
      throw new Error(
        `Tried to apply a transformation for a KPuzzle (${t2.kpuzzle.name()}) to a different KPuzzle (${this.kpuzzle.name()}).`,
      );
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
}
