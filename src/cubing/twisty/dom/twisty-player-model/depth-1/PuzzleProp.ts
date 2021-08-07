import type { PuzzleID } from "../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class PuzzleProp extends SimpleTwistyPropSource<PuzzleID> {
  async getDefaultValue(): Promise<PuzzleID> {
    return "3x3x3";
  }
}
