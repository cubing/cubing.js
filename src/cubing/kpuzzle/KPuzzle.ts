import { Alg, Move } from "../alg";
import type { PGNotation } from "../puzzle-geometry/PuzzleGeometry";
import { algToTransformation } from "./calculate";
import { moveToTransformationUncached } from "./construct";
import { KPattern } from "./KPattern";
import type {
  KPuzzleDefinition,
  KPuzzleOrbitDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";
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

  #indexedOrbits: Record<string, KPuzzleOrbitDefinition> | undefined;
  // Note: this function is needed much more rarely than you might think. Most
  // operations related to orbits require iterating through all of them, for
  // which the following is better:
  //
  //    for (const orbitDefinition of kpuzzle.definition.orbits) { // …
  //    }
  lookupOrbitDefinition(orbitName: string): KPuzzleOrbitDefinition {
    this.#indexedOrbits ||= (() => {
      const indexedOrbits: Record<string, KPuzzleOrbitDefinition> = {};
      for (const orbitDefinition of this.definition.orbits) {
        indexedOrbits[orbitDefinition.orbitName] = orbitDefinition;
      }
      return indexedOrbits;
    })();
    return this.#indexedOrbits[orbitName];
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

  defaultPattern(): KPattern {
    return new KPattern(this, this.definition.defaultPattern);
  }

  #cachedCanConvertDefaultPatternToUniqueTransformation: boolean | undefined;
  // TODO: Handle incomplete default pattern data
  canConvertDefaultPatternToUniqueTransformation(): boolean {
    return (this.#cachedCanConvertDefaultPatternToUniqueTransformation ??=
      ((): boolean => {
        for (const orbitDefinition of this.definition.orbits) {
          const pieces = new Array(orbitDefinition.numPieces).fill(false);
          for (const piece of this.definition.defaultPattern[
            orbitDefinition.orbitName
          ].pieces) {
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
