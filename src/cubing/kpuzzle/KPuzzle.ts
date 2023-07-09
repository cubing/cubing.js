import { KState, KTransformation } from ".";
import { Alg, Move } from "../alg";
import type { PGNotation } from "../puzzle-geometry/PuzzleGeometry";
import { algToTransformation } from "./calculate";
import { moveToTransformationUncached } from "./construct";
import type { KPuzzleDefinition } from "./KPuzzleDefinition";

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

  #moveToTransformationCache = new Map<string, KTransformation>();
  moveToTransformation(move: Move | string): KTransformation {
    if (typeof move === "string") {
      move = new Move(move);
    }
    const cacheKey = move.toString();
    const cachedTransformation: KTransformation | undefined =
      this.#moveToTransformationCache.get(cacheKey);
    if (cachedTransformation) {
      // TODO: clone better?
      // TODO: handle cached identity status?
      return new KTransformation(this, cachedTransformation.transformationData);
    }

    if (this.experimentalPGNotation) {
      const transformationData = this.experimentalPGNotation.lookupMove(move);
      if (!transformationData) {
        throw new Error(`could not map to internal move: ${move}`);
      }
      this.#moveToTransformationCache.set(
        cacheKey,
        new KTransformation(this, transformationData),
      );
      return new KTransformation(this, transformationData);
    }

    const transformation = moveToTransformationUncached(this, move);
    this.#moveToTransformationCache.set(cacheKey, transformation);
    return new KTransformation(this, transformation.transformationData);
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
        for (const orbitView of this.startState().orbitViews()) {
          // TODO: handle an "is default" case?
          const orbitDef = orbitView.orbitDefinition;
          const pieces = new Array(orbitDef.numPieces).fill(false);
          for (const piece of orbitView.getPieces()) {
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
