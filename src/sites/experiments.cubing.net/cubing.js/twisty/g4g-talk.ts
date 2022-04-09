import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import { setGlobalPixelRatioOverride } from "../../../../cubing/twisty/views/canvas";
// import { demoSpinCamera } from "./demo-spin-camera";

const pixelRatio = new URL(location.href).searchParams.get("pixelRatio") ?? "0.5";
if (pixelRatio !== null) {
  setGlobalPixelRatioOverride(parseFloat(pixelRatio));
}

const twistyPlayer = document.querySelector("twisty-player") as TwistyPlayer;

const tempo = new URL(location.href).searchParams.get("tempo");
if (tempo !== null) {
  twistyPlayer.tempoScale = parseFloat(tempo);
} else {
  twistyPlayer.tempoScale = 1.25;
}

twistyPlayer.experimentalModel.playingInfo.set({
  playing: true,
  loop: true,
});

// demoSpinCamera(twistyPlayer);
