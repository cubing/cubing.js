import { Alg, Move } from "../alg";
import type { PGNotation } from "../puzzle-geometry/PuzzleGeometry";
import { algToTransformation } from "./calculate";
import { moveToTransformationUncached } from "./construct";
import type {
  KPuzzleDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";
import { KState } from "./KState";
import { KTransformation } from "./KTransformation";

export type KTransformationSource = Alg | Move | string | KTransformation;

export class KPuzzle {
  private experimentalPGNotation: PGNotation | undefined;
  constructor(
    public readonly definition: KPuzzleDefinition,
    options?: {
      experimentalPGNotation?: PGNotation;
    },
  ) {
    this.experimentalPGNotation = options?.experimentalPGNotation;
  }

  name(): string {
    return this.definition.name; // TODO
  }

  identityTransformation(): KTransformation {
    return KTransformation.experimentalConstructIdentity(this);
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

    if (this.experimentalPGNotation) {
      const transformationData = this.experimentalPGNotation.lookupMove(move);
      if (!transformationData) {
        throw new Error(`could not map to internal move: ${move}`);
      }
      this.#moveToTransformationDataCache.set(cacheKey, transformationData);
      return new KTransformation(this, transformationData);
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

  /** @deprecated */
  toTransformation(source: KTransformationSource): KTransformation {
    if (typeof source === "string") {
      return this.algToTransformation(source);
    } else if ((source as Alg | null)?.is?.(Alg)) {
      return this.algToTransformation(source as Alg);
    } else if ((source as Move | null)?.is?.(Move)) {
      return this.moveToTransformation(source as Move);
    } else {
      return source as KTransformation;
    }
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
