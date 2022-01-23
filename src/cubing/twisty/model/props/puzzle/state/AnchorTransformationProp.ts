import type { KTransformation } from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { SetupToLocation } from "./SetupAnchorProp";

interface AnchorTransformationPropInputs {
  setupTransformation: KTransformation | null;
  setupAnchor: SetupToLocation;
  setupAlgTransformation: KTransformation;
  indexer: AlgIndexer;
}

export class AnchorTransformationProp extends TwistyPropDerived<
  AnchorTransformationPropInputs,
  KTransformation
> {
  derive(inputs: AnchorTransformationPropInputs): KTransformation {
    if (inputs.setupTransformation) {
      return inputs.setupTransformation;
    }
    switch (inputs.setupAnchor) {
      case "start":
        return inputs.setupAlgTransformation;
      case "end": {
        const algTransformation = inputs.indexer.transformationAtIndex(
          inputs.indexer.numAnimatedLeaves(),
        );
        const inverseAlgTransformation = algTransformation.invert();
        return inputs.setupAlgTransformation.applyTransformation(
          inverseAlgTransformation,
        );
      }
      default:
        throw new Error("Unimplemented!");
    }
  }
}
