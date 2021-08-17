import type { Alg } from "../../../../../alg";
import type { KPuzzleDefinition } from "../../../../../kpuzzle";
import type { Transformation } from "../../../../../puzzle-geometry/interfaces";
import { KPuzzleWrapper } from "../../../../3D/puzzles/KPuzzleWrapper";
import { TreeAlgIndexer } from "../../../../animation/indexer/tree/TreeAlgIndexer";
import type { AlgWithIssues } from "../depth-0/AlgProp";
import { TwistyPropDerived } from "../TwistyProp";

type AlgTransformationPropInputs = {
  alg: AlgWithIssues;
  def: KPuzzleDefinition;
};

export class AlgTransformationProp extends TwistyPropDerived<
  AlgTransformationPropInputs,
  Transformation
> {
  derive(input: AlgTransformationPropInputs): Transformation {
    return this.applyAlg(input.def, input.alg.alg);
  }

  applyAlg(def: KPuzzleDefinition, alg: Alg): Transformation {
    const kpuzzleWrapper = new KPuzzleWrapper(def); // TODO: Remove this layer.
    const indexer = new TreeAlgIndexer(kpuzzleWrapper, alg); // TODO: Use a direct efficient traversal in `cubing/kpuzzle` instead of instantiating a whole indexer.
    return indexer.transformAtIndex(
      indexer.numAnimatedLeaves(),
    ) as Transformation;
  }
}
