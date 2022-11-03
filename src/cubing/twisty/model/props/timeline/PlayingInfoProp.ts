import { BoundaryType, Direction } from "../../../controllers/AnimationTypes";
import { TwistyPropSource } from "../TwistyProp";

export type SimpleDirection = Direction.Forwards | Direction.Backwards;

export interface PlayingInfo {
  playing: boolean;
  direction: SimpleDirection;
  untilBoundary: BoundaryType; // TODO: allows this to be optional in the setter?
  // TODO: Is `loop` responsible to add at this point? Maybe we should wait until we've figured out autoplay?
  // TODO: Combine `loop` into something with BoundaryType?
  loop: boolean;
}

// TODO: direction,
export class PlayingInfoProp extends TwistyPropSource<
  PlayingInfo,
  Partial<PlayingInfo>
> {
  public override async getDefaultValue(): Promise<PlayingInfo> {
    return {
      direction: Direction.Forwards,
      playing: false,
      untilBoundary: BoundaryType.EntireTimeline,
      loop: false,
    };
  }

  protected override async derive(
    newInfo: Partial<PlayingInfo>,
    oldValuePromise: Promise<PlayingInfo>,
  ): Promise<PlayingInfo> {
    const oldValue = await oldValuePromise;

    const newValue: PlayingInfo = Object.assign({}, oldValue);
    Object.assign(newValue, newInfo);
    return newValue;
  }

  protected override canReuseValue(v1: PlayingInfo, v2: PlayingInfo) {
    return (
      v1.direction === v2.direction &&
      v1.playing === v2.playing &&
      v1.untilBoundary === v2.untilBoundary &&
      v1.loop === v2.loop
    );
  }
}
