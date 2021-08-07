import { Alg } from "../../../../alg";
import { KPuzzle, KPuzzleDefinition } from "../../../../kpuzzle";
import { AlgIssues, AlgWithIssues } from "../depth-1/AlgProp";
import { TwistyPropDerived } from "../TwistyProp";

export class PuzzleAlgProp extends TwistyPropDerived<
  { algWithIssues: AlgWithIssues; puzzleDef: KPuzzleDefinition },
  AlgWithIssues
> {
  async derive(inputs: {
    algWithIssues: AlgWithIssues;
    puzzleDef: KPuzzleDefinition;
  }): Promise<AlgWithIssues> {
    console.log("deriving!", this);
    try {
      const kpuzzle = new KPuzzle(inputs.puzzleDef);
      kpuzzle.applyAlg(inputs.algWithIssues.alg);
      // Looks like we could apply the alg!
      return inputs.algWithIssues;
    } catch (e) {
      return {
        alg: new Alg(),
        issues: new AlgIssues({ errors: [`Invalid alg for puzzle: ${e}`] }),
      };
    }
  }
}
