import "../../cubing/twisty"
import {Twisty3DCanvas, TwistyPlayer} from "../../cubing/twisty"

const player: TwistyPlayer = document.querySelector("twisty-player")!;

document.querySelector("#screenshot")?.addEventListener("click", () => {
  const twisty3DCanvas = player.viewerElems[0] as Twisty3DCanvas;
  console.log(twisty3DCanvas.renderToDataURL({squareCrop: true}));
})
