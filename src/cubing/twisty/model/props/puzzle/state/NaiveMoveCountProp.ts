import { countMoves } from "../../../../../notation";
import { TwistyPropDerived } from "../../TwistyProp";
import type { AlgWithIssues } from "./AlgProp";

interface NaiveMoveCountPropInputs {
  alg: AlgWithIssues;
}

// TODO: handle metrics
export class NaiveMoveCountProp extends TwistyPropDerived<
  NaiveMoveCountPropInputs,
  number | null
> {
  derive(inputs: NaiveMoveCountPropInputs): number | null {
    if (inputs.alg.issues.errors.length > 0) {
      return null;
    }
    return countMoves(inputs.alg.alg);
  }
}
