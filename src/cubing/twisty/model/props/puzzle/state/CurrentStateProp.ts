import type { KTransformation } from "../../../../../kpuzzle";
import type { KState } from "../../../../../kpuzzle/KState";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { CurrentLeavesSimplified } from "./CurrentLeavesSimplified";

interface CurrentTransformationPropInputs {
  anchoredStart: KTransformation; // kpuzzle todo: KState?
  currentLeavesSimplified: CurrentLeavesSimplified;
  indexer: AlgIndexer;
}

// TODO: Make this so we don't have to handle the finishing moves?
export class CurrentStateProp extends TwistyPropDerived<
  CurrentTransformationPropInputs,
  KState
> {
  derive(inputs: CurrentTransformationPropInputs): KState {
    let transformation: KTransformation = inputs.indexer.transformationAtIndex(
      inputs.currentLeavesSimplified.stateIndex,
    );
    transformation = inputs.anchoredStart.applyTransformation(transformation);

    // TODO: handle non-commutative finished/finishing/current moves.
    for (const finishingMove of inputs.currentLeavesSimplified.movesFinishing) {
      transformation = transformation.applyMove(finishingMove);
    }
    for (const finishedMove of inputs.currentLeavesSimplified.movesFinished) {
      transformation = transformation.applyMove(finishedMove);
    }
    return transformation.toKState(); // kpuzzle todo
  }
}
