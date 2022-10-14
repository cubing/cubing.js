import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import { setGlobalPixelRatioOverride } from "../../../../cubing/twisty/views/canvas";
import { demoSpinCamera, getScaleParam } from "./demo-spin-camera";

const pixelRatio = new URL(location.href).searchParams.get("pixelRatio");
if (pixelRatio !== null) {
  setGlobalPixelRatioOverride(parseFloat(pixelRatio));
}

const twistyPlayer = document.querySelector("twisty-player") as TwistyPlayer;
twistyPlayer.tempoScale = getScaleParam("tempo");
twistyPlayer.experimentalModel.playingInfo.set({
  playing: true,
  loop: true,
});

demoSpinCamera(
  twistyPlayer,
  getScaleParam("spinTempo", getScaleParam("tempo")),
);
