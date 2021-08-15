import type { ButtonCommand } from "../../controllers/TwistyButtonsV2";
import type { CoarseTimelineInfo as CoarseTimelineInfo } from "../depth-7/CoarseTimelineInfoProp";
import { TwistyPropDerived } from "../TwistyProp";

export const buttonIcons = [
  "skip-to-start",
  "skip-to-end",
  "step-forward",
  "step-backward",
  "pause",
  "play",
  "enter-fullscreen",
  "exit-fullscreen",
  "twizzle-tw",
];
export type ButtonIcon = typeof buttonIcons[number];

interface ButtonAppearance {
  enabled: boolean;
  icon: ButtonIcon;
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
        icon: "enter-fullscreen",
        title: "Enter fullscreen",
      },
      "jump-to-start": {
        enabled: !inputs.coarseTimelineInfo.atStart,
        icon: "skip-to-start",
        title: "Restart",
      },
      "play-step-backwards": {
        enabled: false,
        icon: "step-backward",
        title: "Step backward",
      },
      "play-pause": {
        enabled: true,
        icon: inputs.coarseTimelineInfo.playing ? "pause" : "play",
        title: inputs.coarseTimelineInfo.playing ? "Pause" : "Play",
      },
      "play-step": {
        enabled: false,
        icon: "step-forward",
        title: "Step forward",
      },
      "jump-to-end": {
        enabled: !inputs.coarseTimelineInfo.atEnd,
        icon: "skip-to-end",
        title: "Skip to End",
      },
      "twizzle-link": {
        enabled: true,
        icon: "twizzle-tw",
        title: "View at Twizzle",
      },
    };
    return buttonAppearances;
  }
}
