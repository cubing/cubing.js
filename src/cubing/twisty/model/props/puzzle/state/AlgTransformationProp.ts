import type { KPuzzle, KTransformation } from "../../../../../kpuzzle/index.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import type { AlgWithIssues } from "./AlgProp.ts";

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
