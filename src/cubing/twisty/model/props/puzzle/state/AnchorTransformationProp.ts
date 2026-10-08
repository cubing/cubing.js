import type { KTransformation } from "../../../../../kpuzzle/index.ts";
import type {
  AlgIndexer,
  LeafIndex,
} from "../../../../controllers/indexer/AlgIndexer.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import type { SetupToLocation } from "./SetupAnchorProp.ts";

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
          inputs.indexer.numAnimatedLeaves() as number as LeafIndex,
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
