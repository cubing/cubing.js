import { Direction } from "../../../../animation/cursor/CursorTypes";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type SimpleDirection = Direction.Forwards | Direction.Backwards;

// TODO: direction,
export class PlayingProp extends SimpleTwistyPropSource<SimpleDirection> {
  async getDefaultValue(): Promise<SimpleDirection> {
    return Direction.Forwards;
  }
}
