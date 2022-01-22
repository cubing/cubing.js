import type { KPuzzle, KTransformation } from "../../../../../kpuzzle";
import { TwistyPropDerived } from "../../TwistyProp";
import type { AlgWithIssues } from "./AlgProp";

type AlgTransformationPropInputs = {
  setupAlg: AlgWithIssues;
  kpuzzle: KPuzzle;
};

export class AlgTransformationProp extends TwistyPropDerived<
  AlgTransformationPropInputs,
  KTransformation
> {
  derive(input: AlgTransformationPropInputs): KTransformation {
    return input.kpuzzle.algToTransformation(input.setupAlg.alg);
  }
}
