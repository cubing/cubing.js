import { Alg, Move } from "../alg";
import type { PGNotation } from "../puzzle-geometry/PuzzleGeometry";
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

    // if (this.experimentalPGUnswizzle) {
    //   const unswizzledFamily = this.experimentalPGUnswizzle(move);
    //   if (unswizzledFamily === "") {
    //     throw new Error(`could not unswizzle to internal move: ${move}`);
    //   }
    //   console.log("premapped", move.toString(), unswizzledFamily);
    //   move = move.modified({ family: unswizzledFamily });
    //   console.log("remapped", move.toString(), unswizzledFamily);
    // }

    // if (this.experimentalPGNotationMapper) {
    //   const internalMove =
    //     this.experimentalPGNotationMapper.notationToInternal(move);
    //   if (!internalMove) {
    //     throw new Error(`could not map to internal move: ${move}`);
    //   }
    //   console.log("remapped", move.toString(), internalMove.toString());
    //   move = internalMove;
    // }

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

  // TODO: Remove completely with v0.25
  /** @deprecated */
  get state(): never {
    throw new Error("KPuzzle is now a different (stateless) class.");
  }

  // TODO: Remove completely with v0.25
  /** @deprecated */
  reset(): never {
    throw new Error("KPuzzle is now a different (stateless) class.");
  }

  // TODO: Remove completely with v0.25
  /** @deprecated */
  applyMove(_move: Move): never {
    throw new Error(
      "KPuzzle is now a different class. Try `.moveToTransformation()` to get the transformation for a move.",
    );
  }

  // TODO: Remove completely with v0.25
  /** @deprecated */
  applyAlg(_alg: Alg): never {
    throw new Error(
      "KPuzzle is now a different class. Try `.algToTransformation()` to get the transformation for an alg.",
    );
  }
}
