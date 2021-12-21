import { Alg } from "../../../../../alg";
import { KPuzzle, KPuzzleDefinition } from "../../../../../kpuzzle";
import { AlgIssues, AlgWithIssues } from "./AlgProp";
import { TwistyPropDerived } from "../../TwistyProp";

export class PuzzleAlgProp extends TwistyPropDerived<
  { algWithIssues: AlgWithIssues; puzzleDef: KPuzzleDefinition },
  AlgWithIssues
> {
  async derive(inputs: {
    algWithIssues: AlgWithIssues;
    puzzleDef: KPuzzleDefinition;
  }): Promise<AlgWithIssues> {
    try {
      const kpuzzle = new KPuzzle(inputs.puzzleDef);
      kpuzzle.applyAlg(inputs.algWithIssues.alg);
      // Looks like we could apply the alg!
      this.userVisibleErrorTracker!.reset();
      return this.userVisibleErrorTracker!.setAlgWithIssues(
        inputs.algWithIssues,
      );
    } catch (e) {
      return this.userVisibleErrorTracker!.setAlgWithIssues({
        alg: new Alg(),
        issues: new AlgIssues({
          errors: [`Invalid alg for puzzle: ${(e as Error).toString()}`],
        }),
      });
    }
  }
}
