import type { Twisty3DPuzzle } from "../../../3D/puzzles/Twisty3DPuzzle";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { TwistyPropDerived } from "../TwistyProp";

export class Twisty3DProp extends TwistyPropDerived<
  { puzzleID: PuzzleID },
  Twisty3DPuzzle
> {
  async derive(inputs: { puzzleID: PuzzleID }): Promise<Twisty3DPuzzle> {
    const proxy = await this.constructorProxy();
    switch (inputs.puzzleID) {
      case "3x3x3":
        return await proxy.cube3DShim();
      default: {
        return await proxy.pg3dShim(inputs.puzzleID);
      }
    }
  }

  // TODO can we remove the cached proxy?
  // In theory we can, but we've run into situations where imports are not properly cached.
  #cachedConstructorProxy: Promise<typeof import("./3d-proxy")> | null = null;
  async constructorProxy(): Promise<typeof import("./3d-proxy")> {
    return (this.#cachedConstructorProxy ??= import("./3d-proxy"));
  }
}
