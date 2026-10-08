import { Alg } from "../../../../../alg/index.ts";
import type { KPuzzle } from "../../../../../kpuzzle/index.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import { AlgIssues, type AlgWithIssues } from "./AlgProp.ts";

let validate: boolean = true;
export function experimentalSetPuzzleAlgValidation(newValidate: boolean): void {
  validate = newValidate;
}

export class PuzzleAlgProp extends TwistyPropDerived<
  { algWithIssues: AlgWithIssues; kpuzzle: KPuzzle },
  AlgWithIssues
> {
  async derive(inputs: {
    algWithIssues: AlgWithIssues;
    kpuzzle: KPuzzle;
  }): Promise<AlgWithIssues> {
    try {
      if (validate) {
        inputs.kpuzzle.algToTransformation(inputs.algWithIssues.alg);
      }

      // Looks like we could apply the alg!
      return inputs.algWithIssues;
    } catch (e) {
      return {
        alg: new Alg(),
        issues: new AlgIssues({
          errors: [`Invalid alg for puzzle: ${(e as Error).toString()}`],
        }),
      };
    }
  }
}
