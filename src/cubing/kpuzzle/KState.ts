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
  OrbitName,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";
import { offsetMod } from "../alg/cubing-private";

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

  public orbitView(
    orbitName: string,
    mutable: boolean = false,
  ): KStateOrbitView {
    const orbitDef = this.kpuzzle.definition.orbits[orbitName];
    if (!orbitDef) {
      throw "Invalid orbit name for KState.";
    }
    return new KStateOrbitView(orbitDef, this.stateData, orbitName, mutable);
  }

  public *orbitViews(mutable: boolean = false): Generator<KStateOrbitView> {
    for (const orbitName in this.kpuzzle.definition.orbits) {
      yield this.orbitView(orbitName, mutable);
    }
  }
}

// TODO: Combine some of the implementation with `KTransformationOrbitView`?
export class KStateOrbitView {
  #stateData: KStateData;
  constructor(
    public readonly orbitDefinition: KPuzzleOrbitDefinition,
    stateData: KStateData,
    public readonly orbitName: OrbitName,
    public readonly mutable: boolean,
  ) {
    this.#stateData = stateData;
  }

  #orbit(): KStateOrbitData | undefined {
    return this.#stateData[this.orbitName];
  }

  #ensureOrbit(): KStateOrbitData {
    return (this.#stateData[this.orbitName] ??= {});
  }

  #ensureOrbitPieces(): (number | undefined)[] {
    return (this.#ensureOrbit().pieces ??= []);
  }

  #ensureOrbitOrientation(): (number | undefined)[] {
    return (this.#ensureOrbit().orientation ??= []);
  }

  getPieceAt(idx: number): number {
    return this.#orbit()?.pieces?.[idx] ?? idx;
  }

  setPieceAt(idx: number, value: number) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set piece for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbitPieces()[idx] = value;
  }

  *getPieces(): Generator<number> {
    const numPieces = this.orbitDefinition.numPieces;
    for (let i = 0; i < numPieces; i++) {
      yield this.getPieceAt(i);
    }
  }

  setPieces(pieces: Iterable<number | undefined>) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set pieces for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbit().pieces = [...pieces];
  }

  getOrientationAt(idx: number): number {
    return this.#orbit()?.orientation?.[idx] ?? idx;
  }

  // Automatically mods `value` into the appropriate range.
  setOrientationAt(idx: number, value: number) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set orientation for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbitOrientation()[idx] = offsetMod(
      value,
      this.orbitDefinition.numOrientations,
    );
  }

  // `delta` may be negative.
  // Automatically mods `value` into the appropriate range.
  setOrientationDeltaAt(idx: number, delta: number) {
    this.setOrientationAt(idx, this.getOrientationAt(idx) + delta);
  }

  setOrientation(orientation: Iterable<number | undefined>) {
    if (!this.mutable) {
      throw new Error(
        "Tried to set orientations for a non-mutable `KStateOrbitView`.",
      );
    }
    this.#ensureOrbit().orientation = [...orientation];
  }
}
