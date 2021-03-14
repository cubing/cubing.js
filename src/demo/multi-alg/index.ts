import { Alg } from "../../cubing/alg";
import "../../cubing/twisty"
import {Twisty3DCanvas, TwistyPlayer} from "../../cubing/twisty"

const player: TwistyPlayer = document.querySelector("twisty-player")!;

function downloadDataURL(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = "screenshot.png";
  a.click();
}

function getScreenshot(alg: Alg) {
  player.alg = alg;
  const twisty3DCanvas = player.viewerElems[0] as Twisty3DCanvas;
  downloadDataURL(twisty3DCanvas.renderToDataURL({squareCrop: true}));
}

document.querySelector("#screenshot")?.addEventListener("click", () => {
  getScreenshot(new Alg("R U R' U R U2' R'"))
  getScreenshot(new Alg("R U R' U' R' F R F'"))
})
