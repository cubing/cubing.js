import { Alg, Move } from "../alg";
import { algToTransformation } from "./calculate";
import {
  constructIdentityTransformationDataUncached,
  moveToTransformationUncached,
} from "./construct";
import type {
  KPuzzleDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";
import { KState } from "./KState";
import { KTransformation } from "./KTransformation";

export class KPuzzle {
  constructor(public readonly definition: KPuzzleDefinition) {}

  name(): string {
    return this.definition.name; // TODO
  }

  #cachedIdentityTransformationData: KTransformationData | null = null;
  identityTransformation(): KTransformation {
    // TODO: Can we safely cache the `KTransformation` itself?
    // TODO: construct so the `KTransformation` already caches that it's the identity.
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

  algToTransformation(alg: Alg | string): KTransformation {
    if (typeof alg === "string") {
      alg = new Alg(alg);
    }
    return algToTransformation(alg, this);
  }

  startState(): KState {
    return new KState(this, this.definition.startStateData);
  }

  #cachedCanConvertStateToUniqueTransformation: boolean | undefined;
  // TODO: Handle incomplete start state data
  canConvertStateToUniqueTransformation(): boolean {
    return (this.#cachedCanConvertStateToUniqueTransformation ??=
      ((): boolean => {
        for (const [orbitName, orbitDefinition] of Object.entries(
          this.definition.orbits,
        )) {
          const pieces = new Array(orbitDefinition.numPieces).fill(false);
          for (const piece of this.definition.startStateData[orbitName]
            .pieces) {
            pieces[piece] = true;
          }
          for (const piece of pieces) {
            if (!piece) {
              return false;
            }
          }
        }
        return true;
      })());
  }
}
