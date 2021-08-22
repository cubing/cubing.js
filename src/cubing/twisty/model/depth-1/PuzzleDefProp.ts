import type { KPuzzleDefinition } from "../../../kpuzzle";
import { puzzles } from "../../../puzzles";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { TwistyPropDerived } from "../TwistyProp";

export class PuzzleDefProp extends TwistyPropDerived<
  { puzzle: PuzzleID },
  KPuzzleDefinition
> {
  name = "puzle def";

  async derive(inputs: { puzzle: PuzzleID }): Promise<KPuzzleDefinition> {
    return puzzles[inputs.puzzle].def();
  }
}
