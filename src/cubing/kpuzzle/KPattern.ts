import type { KPuzzle } from "./KPuzzle";
import type { Alg, Move } from "../alg";
import { applyTransformationDataToKPatternData } from "./combine";
import type { KTransformationSource } from "./KPuzzle";
import type {
  KPatternData,
  KTransformationData,
  KTransformationOrbitData,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";
import { isPatternDataIdentical } from "./calculate";

export class KPattern {
  constructor(
    public readonly kpuzzle: KPuzzle,
    public readonly patternData: KPatternData,
  ) {}

  toJSON(): any {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      patternData: this.patternData,
    };
  }

  static fromTransformation(transformation: KTransformation): KPattern {
    const newPatternData = applyTransformationDataToKPatternData(
      transformation.kpuzzle.definition,
      transformation.kpuzzle.definition.defaultPattern,
      transformation.transformationData,
    );
    return new KPattern(transformation.kpuzzle, newPatternData);
  }

  // Convenience function
  /** @deprecated */
  apply(source: KTransformationSource): KPattern {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }

  applyTransformation(transformation: KTransformation): KPattern {
    if (transformation.isIdentityTransformation()) {
      return new KPattern(this.kpuzzle, this.patternData);
    }
    const newPatternData = applyTransformationDataToKPatternData(
      this.kpuzzle.definition,
      this.patternData,
      transformation.transformationData,
    );
    return new KPattern(this.kpuzzle, newPatternData);
  }

  applyMove(move: Move | string): KPattern {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }

  applyAlg(alg: Alg | string): KPattern {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }

  isIdentical(other: KPattern): boolean {
    return isPatternDataIdentical(
      this.kpuzzle,
      this.patternData,
      other.patternData,
    );
  }

  /** @deprecated */
  experimentalToTransformation(): KTransformation | null {
    if (!this.kpuzzle.canConvertDefaultPatternToUniqueTransformation()) {
      return null;
    }
    const transformationData: KTransformationData = {};
    for (const [orbitName, patternOrbitData] of Object.entries(
      this.patternData,
    )) {
      const transformationOrbit: KTransformationOrbitData = {
        permutation: patternOrbitData.pieces,
        orientationDelta: patternOrbitData.orientation,
      };
      transformationData[orbitName] = transformationOrbit;
    }
    return new KTransformation(this.kpuzzle, transformationData);
  }

  experimentalIsSolved(options: {
    ignorePuzzleOrientation: boolean;
    ignoreCenterOrientation: boolean;
  }): boolean {
    if (!this.kpuzzle.definition.experimentalIsPatternSolved) {
      throw new Error(
        "`KPattern.experimentalIsPatternSolved()` is not supported for this puzzle at the moment.",
      );
    }
    return this.kpuzzle.definition.experimentalIsPatternSolved(this, options);
  }
}
