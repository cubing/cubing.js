import type { ButtonCommand } from "../../../views/control-panel/TwistyButtons";
import { TwistyPropDerived } from "../TwistyProp";
import type { DetailedTimelineInfo } from "./DetailedTimelineInfoProp";
import type { PlayingInfo } from "./PlayingInfoProp";

interface ButtonAppearance {
  enabled: boolean;
  icon: string;
  title: string;
}
export type ButtonAppearances = Record<ButtonCommand, ButtonAppearance>;

interface CoarseTimelineInfoInputs {
  playingInfo: PlayingInfo;
  detailedTimelineInfo: DetailedTimelineInfo;
}

export interface CoarseTimelineInfo {
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
}

// This started as a version of `EffectiveTimestamp` without the actual
// timestamp, to enable easier caching.
export class CoarseTimelineInfoProp extends TwistyPropDerived<
  CoarseTimelineInfoInputs,
  CoarseTimelineInfo
> {
  protected override derive(
    inputs: CoarseTimelineInfoInputs,
  ): CoarseTimelineInfo {
    return {
      playing: inputs.playingInfo.playing,
      atStart: inputs.detailedTimelineInfo.atStart,
      atEnd: inputs.detailedTimelineInfo.atEnd,
    };
  }

  protected override canReuseValue(
    v1: CoarseTimelineInfo,
    v2: CoarseTimelineInfo,
  ): boolean {
    return (
      v1.playing === v2.playing &&
      v1.atStart === v2.atStart &&
      v1.atEnd === v2.atEnd
    );
  }
}
