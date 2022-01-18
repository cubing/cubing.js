import type { KPuzzle, KTransformationData } from ".";
import { KTransformation } from "./KTransformation";
import type { Alg, Move } from "../alg";
import { applyTransformationDataToStateData } from "./combine";
import type { KStateData } from "./KPuzzleDefinition";

export class KState {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly stateData: KStateData,
  ) {}

  static fromTransformation(transformation: KTransformation): KState {
    const newStateData = applyTransformationDataToStateData(
      transformation.kpuzzle.definition,
      transformation.kpuzzle.definition.startStateData,
      transformation.transformationData,
    );
    return new KState(transformation.kpuzzle, newStateData);
  }

  applyTransformation(transformation: KTransformation): KState {
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

  // @deprecated
  experimentalToTransformation(): KTransformation | null {
    if (!this.kpuzzle.canConvertStateToUniqueTransformation()) {
      return null;
    }
    const transformationData: KTransformationData = {};
    for (const [orbitName, stateOrbitData] of Object.entries(this.stateData)) {
      transformationData[orbitName].permutation = stateOrbitData.pieces;
      transformationData[orbitName].orientation = stateOrbitData.orientation;
    }
    return new KTransformation(this.kpuzzle, transformationData);
  }
}
