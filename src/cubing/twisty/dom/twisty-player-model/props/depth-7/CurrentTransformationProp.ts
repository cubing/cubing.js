import {
  combineTransformations,
  KPuzzleDefinition,
} from "../../../../../kpuzzle";
import type { Transformation } from "../../../../../puzzle-geometry/interfaces";
import type {
  AlgIndexer,
  CurrentMoveInfo,
} from "../../../../animation/indexer/AlgIndexer";
import { TwistyPropDerived } from "../TwistyProp";

interface CurentTransformationPropInputs {
  anchoredStart: Transformation;
  currentMoveInfo: CurrentMoveInfo;
  indexer: AlgIndexer<any>;
  def: KPuzzleDefinition;
}

// This started as a version of `EffectiveTimestamp` without the actual
// timestamp, to enable easier caching.
export class CurentTransformationProp extends TwistyPropDerived<
  CurentTransformationPropInputs,
  Transformation
> {
  derive(inputs: CurentTransformationPropInputs): Transformation {
    const indexedTransformation = inputs.indexer.transformAtIndex(
      inputs.currentMoveInfo.stateIndex,
    ) as any;
    return combineTransformations(
      inputs.def,
      inputs.anchoredStart,
      indexedTransformation,
    );
  }
}
