import type { KTransformation } from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { SetupToLocation } from "./SetupAnchorProp";

interface AnchoredStartPropInputs {
  setupAnchor: SetupToLocation;
  setupTransformation: KTransformation;
  indexer: AlgIndexer;
}

export class AnchoredStartProp extends TwistyPropDerived<
  AnchoredStartPropInputs,
  KTransformation
> {
  derive(inputs: AnchoredStartPropInputs): KTransformation {
    switch (inputs.setupAnchor) {
      case "start":
        return inputs.setupTransformation;
      case "end": {
        const algTransformation = inputs.indexer.transformationAtIndex(
          inputs.indexer.numAnimatedLeaves(),
        );
        const inverseAlgTransformation = algTransformation.invert();
        return inputs.setupTransformation.applyTransformation(
          inverseAlgTransformation,
        );
      }
      default:
        throw new Error("Unimplemented!");
    }
  }
}
