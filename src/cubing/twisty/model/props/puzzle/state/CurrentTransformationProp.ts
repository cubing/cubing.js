import { KSolvePuzzle } from "../../../..";
import {
  oldCombineTransformations,
  OldKPuzzleDefinition,
  OldTransformation,
} from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import type { CurrentLeavesSimplified } from "./CurrentLeavesSimplified";
import { TwistyPropDerived } from "../../TwistyProp";

interface CurrentTransformationPropInputs {
  anchoredStart: OldTransformation;
  currentLeavesSimplified: CurrentLeavesSimplified;
  indexer: AlgIndexer<any>;
  def: OldKPuzzleDefinition;
}

// TODO: Make this so we don't have to handle the finishing moves?
export class CurrentTransformationProp extends TwistyPropDerived<
  CurrentTransformationPropInputs,
  OldTransformation
> {
  derive(inputs: CurrentTransformationPropInputs): OldTransformation {
    let state: OldTransformation = inputs.indexer.transformAtIndex(
      inputs.currentLeavesSimplified.stateIndex,
    ) as any;
    state = oldCombineTransformations(inputs.def, inputs.anchoredStart, state);
    const ksolvePuzzle = new KSolvePuzzle(inputs.def); // TODO: put this elsewhere.
    // TODO: handle non-commutative finished/finishing/current moves.
    for (const finishingMove of inputs.currentLeavesSimplified.movesFinishing) {
      state = oldCombineTransformations(
        inputs.def,
        state,
        ksolvePuzzle.stateFromMove(finishingMove),
      );
    }
    for (const finishedMove of inputs.currentLeavesSimplified.movesFinished) {
      state = oldCombineTransformations(
        inputs.def,
        state,
        ksolvePuzzle.stateFromMove(finishedMove),
      );
    }
    return state;
  }
}
