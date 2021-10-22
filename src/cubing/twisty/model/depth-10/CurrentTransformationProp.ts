import { KSolvePuzzle } from "../..";
import {
  combineTransformations,
  KPuzzleDefinition,
  Transformation,
} from "../../../kpuzzle";
import type { AlgIndexer } from "../../old/animation/indexer/AlgIndexer";
import type { CurrentLeavesSimplified } from "../depth-9/CurrentLeavesSimplified";
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
  derive(inputs: CurrentTransformationPropInputs): Transformation {
    let state: Transformation = inputs.indexer.transformAtIndex(
      inputs.currentLeavesSimplified.stateIndex,
    ) as any;
    state = combineTransformations(inputs.def, inputs.anchoredStart, state);
    const ksolvePuzzle = new KSolvePuzzle(inputs.def); // TODO: put this elsewhere.
    // TODO: handle non-commutative finished/finishing/current moves.
    for (const finishingMove of inputs.currentLeavesSimplified.movesFinishing) {
      state = combineTransformations(
        inputs.def,
        state,
        ksolvePuzzle.stateFromMove(finishingMove),
      );
    }
    for (const finishedMove of inputs.currentLeavesSimplified.movesFinished) {
      state = combineTransformations(
        inputs.def,
        state,
        ksolvePuzzle.stateFromMove(finishedMove),
      );
    }
    return state;
  }
}
