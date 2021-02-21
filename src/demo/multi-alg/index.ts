import { parseAlg, Sequence } from "../../cubing/alg";
import { Twisty3DCanvas, TwistyPlayer } from "../../cubing/twisty";

const player = new TwistyPlayer();
document.body.appendChild(player);

player.experimentalStickering = "PLL";

function downloadURL(url: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = "screenshot.png";
  a.click();
}

function drawAlg(s: Sequence) {
  player.alg = s;
  player.experimentalSetupAnchor = "end";

  const canvas = player.viewerElems[0] as Twisty3DCanvas;
  const dataURL = canvas.renderToDataURL();
  downloadURL(dataURL);
}

setTimeout(() => {
  drawAlg(parseAlg("R2 U R U R' U' R' U' R' U R'"));
  drawAlg(parseAlg("R U R' U' R' F R2 U' R' U' R U R' F'"));
}, 100);
