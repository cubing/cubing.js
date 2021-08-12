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

interface ButtonAppearancePropInputs {
  effectiveTimestamp: EffectiveTimestamp;
  playing: PlayingInfo;
}

export class ButtonAppearanceProp extends TwistyPropDerived<
  ButtonAppearancePropInputs,
  ButtonAppearances
> {
  derive(inputs: ButtonAppearancePropInputs): ButtonAppearances {
    const buttonAppearances = {
      "fullscreen": {
        enabled: false,
        icon: "↕️",
        title: "Enter fullscreen",
      },
      "jump-to-start": {
        enabled: !inputs.effectiveTimestamp.atStart,
        icon: "⏮",
        title: "Restart",
      },
      "play-step-backwards": {
        enabled: false,
        icon: "⏪",
        title: "Step backward",
      },
      "play-pause": {
        enabled: true,
        icon: inputs.playing.playing ? "⏸" : "▶️",
        title: inputs.playing.playing ? "Pause" : "Play",
      },
      "play-step": {
        enabled: false,
        icon: "⏩",
        title: "Step forward",
      },
      "jump-to-end": {
        enabled: !inputs.effectiveTimestamp.atEnd,
        icon: "⏭",
        title: "Skip to End",
      },
      "twizzle-link": { enabled: true, icon: "🔗", title: "View at Twizzle" },
    };
    return buttonAppearances;
  }
}
