import type { Alg } from "../../../../../alg";
import type {
  OldKPuzzleDefinition,
  OldTransformation,
} from "../../../../../kpuzzle";
import { KPuzzleWrapper } from "../../../../views/3D/puzzles/KPuzzleWrapper";
import { TreeAlgIndexer } from "../../../../controllers/indexer/tree/TreeAlgIndexer";
import type { AlgWithIssues } from "./AlgProp";
import { TwistyPropDerived } from "../../TwistyProp";

type AlgTransformationPropInputs = {
  alg: AlgWithIssues;
  def: OldKPuzzleDefinition;
};

export class AlgTransformationProp extends TwistyPropDerived<
  AlgTransformationPropInputs,
  OldTransformation
> {
  derive(input: AlgTransformationPropInputs): OldTransformation {
    return this.applyAlg(input.def, input.alg.alg);
  }

  applyAlg(def: OldKPuzzleDefinition, alg: Alg): OldTransformation {
    const kpuzzleWrapper = new KPuzzleWrapper(def); // TODO: Remove this layer.
    const indexer = new TreeAlgIndexer(kpuzzleWrapper, alg); // TODO: Use a direct efficient traversal in `cubing/kpuzzle` instead of instantiating a whole indexer.
    return indexer.transformAtIndex(
      indexer.numAnimatedLeaves(),
    ) as OldTransformation;
  }
}
