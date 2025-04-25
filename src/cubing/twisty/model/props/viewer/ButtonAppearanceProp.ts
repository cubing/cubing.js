import type { ButtonCommand } from "../../../views/control-panel/TwistyButtons";
import { fullscreenEnabled } from "../../../views/control-panel/webkit-fullscreen";
import { TwistyPropDerived } from "../TwistyProp";
import type { CoarseTimelineInfo } from "../timeline/CoarseTimelineInfoProp";
import type { ViewerLinkPageWithAuto } from "./ViewerLinkProp";

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
export type ButtonIcon = (typeof buttonIcons)[number];

interface ButtonAppearance {
  enabled: boolean;
  icon: ButtonIcon;
  title: string;
  hidden?: boolean;
}
export type ButtonAppearances = Record<ButtonCommand, ButtonAppearance>;

// TODO: reduce inputs to avoid unnecessary updates.
interface ButtonAppearancePropInputs {
  coarseTimelineInfo: CoarseTimelineInfo;
  viewerLink: ViewerLinkPageWithAuto;
}

export class ButtonAppearanceProp extends TwistyPropDerived<
  ButtonAppearancePropInputs,
  ButtonAppearances
> {
  // TODO: This still seems to fire twice for play/pause?
  derive(inputs: ButtonAppearancePropInputs): ButtonAppearances {
    const buttonAppearances = {
      fullscreen: {
        // TODO: Cache?// TODO: Cache?
        enabled: fullscreenEnabled,
        icon:
          // TODO: Check against the expected element?
          // TODO: This will *not* update when we enter/leave fullscreen. We need to work more closely with the controller.
          document.fullscreenElement === null
            ? "enter-fullscreen"
            : "exit-fullscreen",
        title: "Enter fullscreen",
      },
      "jump-to-start": {
        enabled: !inputs.coarseTimelineInfo.atStart,
        icon: "skip-to-start",
        title: "Restart",
      },
      "play-step-backwards": {
        enabled: !inputs.coarseTimelineInfo.atStart,
        icon: "step-backward",
        title: "Step backward",
      },
      "play-pause": {
        enabled: !(
          inputs.coarseTimelineInfo.atStart && inputs.coarseTimelineInfo.atEnd
        ),
        icon: inputs.coarseTimelineInfo.playing ? "pause" : "play",
        title: inputs.coarseTimelineInfo.playing ? "Pause" : "Play",
      },
      "play-step": {
        enabled: !inputs.coarseTimelineInfo.atEnd,
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
        hidden: inputs.viewerLink === "none",
      },
    };
    return buttonAppearances;
  }
}
