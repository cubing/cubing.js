import {
  oldCombineTransformations,
  oldInvertTransformation,
  OldKPuzzleDefinition,
  OldTransformation,
} from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { SetupToLocation } from "./SetupAnchorProp";

interface AnchoredStartPropInputs {
  setupAnchor: SetupToLocation;
  setupTransformation: OldTransformation;
  indexer: AlgIndexer<any>;
  def: OldKPuzzleDefinition;
}

export class AnchoredStartProp extends TwistyPropDerived<
  AnchoredStartPropInputs,
  OldTransformation
> {
  derive(inputs: AnchoredStartPropInputs): OldTransformation {
    switch (inputs.setupAnchor) {
      case "start":
        return inputs.setupTransformation;
      case "end": {
        const algTransformation = inputs.indexer.transformAtIndex(
          inputs.indexer.numAnimatedLeaves(),
        ) as OldTransformation;
        const inverseAlgTransformation = oldInvertTransformation(
          inputs.def,
          algTransformation,
        );
        return oldCombineTransformations(
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
