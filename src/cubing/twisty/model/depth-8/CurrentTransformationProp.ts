import { KSolvePuzzle } from "../..";
import { combineTransformations, KPuzzleDefinition } from "../../../kpuzzle";
import type { Transformation } from "../../../puzzle-geometry/interfaces";
import type { AlgIndexer } from "../../old/animation/indexer/AlgIndexer";
import type { CurrentLeavesSimplified } from "../depth-7/CurrentLeavesSimplified";
import { TwistyPropDerived } from "../TwistyProp";

interface CurrentTransformationPropInputs {
  anchoredStart: Transformation;
  currentLeavesSimplified: CurrentLeavesSimplified;
  indexer: AlgIndexer<any>;
  def: KPuzzleDefinition;
}

// TODO: Make this so we don't have to handle the finishing moves?
export class CurrentTransformationProp extends TwistyPropDerived<
  CurrentTransformationPropInputs,
  Transformation
> {
  // TODO: Figure out why this is still firing 6 times during stub demo loading.
  derive(inputs: CurrentTransformationPropInputs): Transformation {
    let state: Transformation = inputs.indexer.transformAtIndex(
      inputs.currentLeavesSimplified.stateIndex,
    ) as any;
    state = combineTransformations(inputs.def, inputs.anchoredStart, state);
    const ksolvePuzzle = new KSolvePuzzle(inputs.def); // TODO: put this elsewhere.
    for (const finishingMove of inputs.currentLeavesSimplified.movesFinishing) {
      state = combineTransformations(
        inputs.def,
        state,
        ksolvePuzzle.stateFromMove(finishingMove),
      );
    }
    return state;
  }
}
