import { SimpleTwistyPropSource } from "../TwistyProp";

// TODO: direction,
export class PlayingProp extends SimpleTwistyPropSource<{ playing: boolean }> {
  async getDefaultValue(): Promise<{ playing: boolean }> {
    return { playing: false };
  }
}
