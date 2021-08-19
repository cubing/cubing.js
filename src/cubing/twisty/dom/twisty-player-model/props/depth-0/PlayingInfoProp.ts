import {
  BoundaryType,
  Direction,
} from "../../../../animation/cursor/CursorTypes";
import { TwistyPropSource } from "../TwistyProp";

export type SimpleDirection = Direction.Forwards | Direction.Backwards;

export interface PlayingInfo {
  playing: boolean;
  direction: SimpleDirection;
  untilBoundary: BoundaryType; // TODO: allows this to be optional in the setter?
}

// TODO: direction,
export class PlayingInfoProp extends TwistyPropSource<
  PlayingInfo,
  Partial<PlayingInfo>
> {
  async getDefaultValue(): Promise<PlayingInfo> {
    return {
      direction: Direction.Forwards,
      playing: false,
      untilBoundary: BoundaryType.EntireTimeline,
    };
  }

  async derive(
    newInfo: Partial<PlayingInfo>,
    oldValuePromise: Promise<PlayingInfo>,
  ): Promise<PlayingInfo> {
    const oldValue = await oldValuePromise;

    const newValue: PlayingInfo = Object.assign({}, oldValue);
    Object.assign(newValue, newInfo);
    return newValue;
  }

  canReuseValue(v1: PlayingInfo, v2: PlayingInfo) {
    return (
      v1.direction === v2.direction &&
      v1.playing === v2.playing &&
      v1.untilBoundary === v2.untilBoundary
    );
  }
}
