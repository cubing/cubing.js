import type { KPuzzle } from "./KPuzzle";
import type { Alg, Move } from "../alg";
import { applyTransformationDataToStateData } from "./combine";
import type { KTransformationSource } from "./KPuzzle";
import type {
  KPuzzleOrbitDefinition,
  KStateData,
  KStateOrbitData,
  KTransformationData,
  KTransformationOrbitData,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";

export class KState {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly stateData: KStateData,
  ) {}

  toJSON(): any {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      stateData: this.stateData,
    };
  }

  static fromTransformation(transformation: KTransformation): KState {
    const newStateData = applyTransformationDataToStateData(
      transformation.kpuzzle.definition,
      transformation.kpuzzle.definition.startStateData,
      transformation.transformationData,
    );
    return new KState(transformation.kpuzzle, newStateData);
  }

  // Convenience function
  /** @deprecated */
  apply(source: KTransformationSource): KState {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }

  applyTransformation(transformation: KTransformation): KState {
    if (transformation.isIdentityTransformation()) {
      return new KState(this.kpuzzle, this.stateData);
    }
    const newStateData = applyTransformationDataToStateData(
      this.kpuzzle.definition,
      this.stateData,
      transformation.transformationData,
    );
    return new KState(this.kpuzzle, newStateData);
  }

  applyMove(move: Move | string): KState {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }

  applyAlg(alg: Alg | string): KState {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }

  /** @deprecated */
  experimentalToTransformation(): KTransformation | null {
    if (!this.kpuzzle.canConvertStateToUniqueTransformation()) {
      return null;
    }
    const transformationData: KTransformationData = {};
    for (const [orbitName, stateOrbitData] of Object.entries(this.stateData)) {
      const transformationOrbit: KTransformationOrbitData = {
        permutation: stateOrbitData?.pieces,
        orientation: stateOrbitData?.orientation,
      };
      transformationData[orbitName] = transformationOrbit;
    }
    return new KTransformation(this.kpuzzle, transformationData);
  }

  experimentalIsSolved(options: {
    ignorePuzzleOrientation: boolean;
    ignoreCenterOrientation: boolean;
  }): boolean {
    if (!this.kpuzzle.definition.experimentalIsStateSolved) {
      throw new Error(
        "`KState.experimentalIsSolved()` is not supported for this puzzle at the moment.",
      );
    }
    return this.kpuzzle.definition.experimentalIsStateSolved(this, options);
  }

  public orbitView(orbitName: string): KStateOrbitView {
    const orbitDef = this.kpuzzle.definition.orbits[orbitName];
    if (!orbitDef) {
      throw "Invalid orbit name for KState.";
    }
    return new KStateOrbitView(orbitDef, this.stateData, orbitName);
  }

  public *orbitViews(): Generator<KStateOrbitView> {
    for (const orbitName in this.kpuzzle.definition.orbits) {
      yield this.orbitView(orbitName);
    }
  }
}

// TODO: Combine some of the implementation with `KTransformationOrbitView`?
export class KStateOrbitView {
  #orbitDef: KPuzzleOrbitDefinition;
  #stateData: KStateData;
  #orbitName: string;
  constructor(
    orbitDef: KPuzzleOrbitDefinition,
    stateData: KStateData,
    orbitName: string,
  ) {
    this.#orbitDef = orbitDef;
    this.#stateData = stateData;
    this.#orbitName = orbitName;
  }

  getDefinition(): KPuzzleOrbitDefinition {
    return this.#orbitDef;
  }

  #orbit(): KStateOrbitData | undefined {
    return this.#stateData[this.#orbitName];
  }

  #ensureOrbit(): KStateOrbitData {
    return (this.#stateData[this.#orbitName] ??= {});
  }

  #ensureOrbitPieces(): (number | undefined)[] {
    return (this.#ensureOrbit().pieces ??= []);
  }

  #ensureOrbitOrientation(): (number | undefined)[] {
    return (this.#ensureOrbit().orientation ??= []);
  }

  getPiece(index: number): number {
    return this.#orbit()?.pieces?.[index] ?? index;
  }

  // TODO: prevent write by default.
  setPiece(index: number, value: number) {
    this.#ensureOrbitPieces()[index] = value;
  }

  *getPieces(): Generator<number> {
    const numPieces = this.getDefinition().numPieces;
    for (let i = 0; i < numPieces; i++) {
      yield this.getPiece(i);
    }
  }

  getOrientation(index: number): number {
    return this.#orbit()?.orientation?.[index] ?? index;
  }

  // TODO: prevent write by default.
  setOrientation(index: number, value: number) {
    this.#ensureOrbitOrientation()[index] = value;
  }
}
