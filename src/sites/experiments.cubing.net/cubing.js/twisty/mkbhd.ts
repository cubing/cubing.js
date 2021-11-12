import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import { setGlobalPixelRatioOverride } from "../../../../cubing/twisty/old/dom/viewers/canvas";
import { demoSpinCamera } from "./demo-spin-camera";

const pixelRatio = new URL(location.href).searchParams.get("pixelRatio");
if (pixelRatio !== null) {
  setGlobalPixelRatioOverride(parseFloat(pixelRatio));
}

const twistyPlayer = document.querySelector("twisty-player") as TwistyPlayer;

const tempo = new URL(location.href).searchParams.get("tempo");
if (tempo !== null) {
  twistyPlayer.tempoScale = parseFloat(tempo);
}

// twistyPlayer.experimentalModel.playingInfoProp.set({
//   playing: true,
//   loop: true,
// });

// demoSpinCamera(twistyPlayer);
