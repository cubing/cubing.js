import {
  combineTransformations,
  invertTransformation,
  KPuzzleDefinition,
  Transformation,
} from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../old/animation/indexer/AlgIndexer";
import type { SetupToLocation } from "../../../../old/dom/TwistyPlayerConfig";
import { TwistyPropDerived } from "../../../TwistyProp";

interface AnchoredStartPropInputs {
  setupAnchor: SetupToLocation;
  setupTransformation: Transformation;
  indexer: AlgIndexer<any>;
  def: KPuzzleDefinition;
}

export class AnchoredStartProp extends TwistyPropDerived<
  AnchoredStartPropInputs,
  Transformation
> {
  derive(inputs: AnchoredStartPropInputs): Transformation {
    switch (inputs.setupAnchor) {
      case "start":
        return inputs.setupTransformation;
      case "end": {
        const algTransformation = inputs.indexer.transformAtIndex(
          inputs.indexer.numAnimatedLeaves(),
        ) as Transformation;
        const inverseAlgTransformation = invertTransformation(
          inputs.def,
          algTransformation,
        );
        return combineTransformations(
          inputs.def,
          inputs.setupTransformation,
          inverseAlgTransformation,
        );
      }
      default:
        throw new Error("Unimplemented!");
    }
  }
}
