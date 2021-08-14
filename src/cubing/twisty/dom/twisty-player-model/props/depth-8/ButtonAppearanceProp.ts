import type { ButtonCommand } from "../../controllers/TwistyButtonsV2";
import type { CoarseTimelineInfo as CoarseTimelineInfo } from "../depth-7/CoarseTimelineInfo";
import { TwistyPropDerived } from "../TwistyProp";

interface ButtonAppearance {
  enabled: boolean;
  icon: string;
  title: string;
}
export type ButtonAppearances = Record<ButtonCommand, ButtonAppearance>;

// TODO: reduce inputs to avoid unnecessary updates.
interface ButtonAppearancePropInputs {
  coarseTimelineInfo: CoarseTimelineInfo;
}

export class ButtonAppearanceProp extends TwistyPropDerived<
  ButtonAppearancePropInputs,
  ButtonAppearances
> {
  // TODO: This still seems to fire twice for play/pause?
  derive(inputs: ButtonAppearancePropInputs): ButtonAppearances {
    const buttonAppearances = {
      "fullscreen": {
        enabled: false,
        icon: "↕️",
        title: "Enter fullscreen",
      },
      "jump-to-start": {
        enabled: !inputs.coarseTimelineInfo.atStart,
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
        icon: inputs.coarseTimelineInfo.playing ? "⏸" : "▶️",
        title: inputs.coarseTimelineInfo.playing ? "Pause" : "Play",
      },
      "play-step": {
        enabled: false,
        icon: "⏩",
        title: "Step forward",
      },
      "jump-to-end": {
        enabled: !inputs.coarseTimelineInfo.atEnd,
        icon: "⏭",
        title: "Skip to End",
      },
      "twizzle-link": { enabled: true, icon: "🔗", title: "View at Twizzle" },
    };
    return buttonAppearances;
  }
}
