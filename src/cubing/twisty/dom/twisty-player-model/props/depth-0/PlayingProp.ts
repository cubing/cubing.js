import { BoundaryType } from "../../../../animation/cursor/CursorTypes";
import { SimpleTwistyPropSource } from "../TwistyProp";

export interface PlayingInfo {
  playing: boolean;
  untilBoundary: BoundaryType; // TODO: allows this to be optional in the setter?
}

// TODO: direction,
export class PlayingProp extends SimpleTwistyPropSource<PlayingInfo> {
  async getDefaultValue(): Promise<PlayingInfo> {
    return { playing: false, untilBoundary: BoundaryType.EntireTimeline };
  }
}
