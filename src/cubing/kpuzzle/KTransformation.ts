import {
  invertTransformation,
  isTransformationDataIdentical,
} from "./calculate";
import { combineTransformationData } from "./combine";
import type { KPuzzle } from "./KPuzzle";
import type { KTransformationData } from "./KPuzzleDefinition";

export class KTransformation {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly data: KTransformationData,
  ) {}

  invert(): KTransformation {
    return new KTransformation(
      this.kpuzzle,
      invertTransformation(this.kpuzzle, this.data),
    );
  }

  // @deprecated
  #cachedIsIdentity: boolean | undefined; // TODO: is `null` worse here?
  isIdentity(): boolean {
    return (this.#cachedIsIdentity ??= this.isIdentical(
      this.kpuzzle.identityTransformation(),
    ));
  }

  isIdentical(t2: KTransformation): boolean {
    return isTransformationDataIdentical(this.kpuzzle, this.data, t2.data);
  }

  applyTransformation(t2: KTransformation): KTransformation {
    if (this.kpuzzle !== t2.kpuzzle) {
      throw new Error(
        `Tried to apply a transformation for a KPuzzle (${t2.kpuzzle.name()}) to a different KPuzzle (${this.kpuzzle.name()}).`,
      );
    }

    return new KTransformation(
      this.kpuzzle,
      combineTransformationData(this.kpuzzle.definition, this.data, t2.data),
    );
  }
}
