import { Alg, Newline } from "../../cubing/alg";
import { AlgBuilder } from "../../cubing/alg/AlgBuilder";
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
  const algsTextarea = document.querySelector("#algs")! as HTMLTextAreaElement;
  const algs = new Alg(algsTextarea.value);

  const currentAlgBuilder = new AlgBuilder();
  for (const unit of algs.units()) {
    if (unit.is(Newline)) {
      getScreenshot(currentAlgBuilder.toAlg());
      currentAlgBuilder.reset();
    } else {
      currentAlgBuilder.push(unit);
    }
  }
  getScreenshot(currentAlgBuilder.toAlg());
})
