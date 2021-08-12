import { SimpleTwistyPropSource } from "../TwistyProp";

export interface PlayingInfo {
  playing: boolean;
}

// TODO: direction,
export class PlayingProp extends SimpleTwistyPropSource<PlayingInfo> {
  async getDefaultValue(): Promise<PlayingInfo> {
    return { playing: false };
  }
}
