import { Move } from "../alg";
import {
  constructIdentityTransformationDataUncached,
  moveToTransformationUncached,
} from "./construct";
import type {
  KPuzzleDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";

export class KPuzzle {
  constructor(public readonly definition: KPuzzleDefinition) {}

  name(): string {
    return this.definition.name; // TODO
  }

  #cachedIdentityTransformationData: KTransformationData | null = null;
  identityTransformation(): KTransformation {
    return new KTransformation(
      this,
      (this.#cachedIdentityTransformationData ??=
        constructIdentityTransformationDataUncached(this.definition)),
    );
  }

  #moveToTransformationDataCache = new Map<string, KTransformationData>();
  moveToTransformation(move: Move | string): KTransformation {
    if (typeof move === "string") {
      move = new Move(move);
    }
    const cacheKey = move.toString();
    const cachedTransformationData: KTransformationData | undefined =
      this.#moveToTransformationDataCache.get(cacheKey);
    if (cachedTransformationData) {
      return new KTransformation(this, cachedTransformationData);
    }

    const transformationData = moveToTransformationUncached(this, move);
    this.#moveToTransformationDataCache.set(cacheKey, transformationData);
    return new KTransformation(this, transformationData);
  }
}
