import type { KPuzzleDefinition } from "../../../../kpuzzle";
import { puzzles } from "../../../../puzzles";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { TwistyPropDerived } from "../TwistyProp";

export class PuzzleDefProp extends TwistyPropDerived<
  { puzzle: PuzzleID },
  KPuzzleDefinition
> {
  async derive(inputs: { puzzle: PuzzleID }): Promise<KPuzzleDefinition> {
    return puzzles[inputs.puzzle].def();
  }
}
