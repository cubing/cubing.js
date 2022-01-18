import { Alg } from "../../../../../alg";
import { OldKPuzzle, OldKPuzzleDefinition } from "../../../../../kpuzzle";
import { AlgIssues, AlgWithIssues } from "./AlgProp";
import { TwistyPropDerived } from "../../TwistyProp";

export class PuzzleAlgProp extends TwistyPropDerived<
  { algWithIssues: AlgWithIssues; puzzleDef: OldKPuzzleDefinition },
  AlgWithIssues
> {
  async derive(inputs: {
    algWithIssues: AlgWithIssues;
    puzzleDef: OldKPuzzleDefinition;
  }): Promise<AlgWithIssues> {
    try {
      const kpuzzle = new OldKPuzzle(inputs.puzzleDef);
      kpuzzle.applyAlg(inputs.algWithIssues.alg);
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
