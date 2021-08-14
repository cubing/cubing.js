import type { ButtonCommand } from "../../controllers/TwistyButtonsV2";
import type { PlayingInfo } from "../depth-1/PlayingProp";
import type { EffectiveTimestamp } from "../depth-6/EffectiveTimestamp";
import { TwistyPropDerived } from "../TwistyProp";

interface ButtonAppearance {
  enabled: boolean;
  icon: string;
  title: string;
}
export type ButtonAppearances = Record<ButtonCommand, ButtonAppearance>;

interface CoarseTimelineInfoInputs {
  playingInfo: PlayingInfo;
  effectiveTimestamp: EffectiveTimestamp;
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
  derive(inputs: CoarseTimelineInfoInputs): CoarseTimelineInfo {
    return {
      playing: inputs.playingInfo.playing,
      atStart: inputs.effectiveTimestamp.atStart,
      atEnd: inputs.effectiveTimestamp.atEnd,
    };
  }

  canReuseValue(v1: CoarseTimelineInfo, v2: CoarseTimelineInfo): boolean {
    return (
      v1.playing === v2.playing &&
      v1.atStart === v2.atStart &&
      v1.atEnd === v2.atEnd
    );
  }
}
