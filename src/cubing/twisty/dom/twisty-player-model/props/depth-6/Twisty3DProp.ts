import type { Twisty3DPuzzle } from "../../../..";
import type { PuzzleID } from "../../../TwistyPlayerConfig";
import { proxy3D } from "../../heavy-code-imports/3d";
import { TwistyPropDerived } from "../TwistyProp";

export class Twisty3DProp extends TwistyPropDerived<
  { puzzleID: PuzzleID },
  Twisty3DPuzzle
> {
  async derive(inputs: { puzzleID: PuzzleID }): Promise<Twisty3DPuzzle> {
    const proxy = await proxy3D();
    switch (inputs.puzzleID) {
      case "3x3x3":
        return await proxy.cube3DShim();
      default: {
        return await proxy.pg3dShim(inputs.puzzleID);
      }
    }
  }
}
