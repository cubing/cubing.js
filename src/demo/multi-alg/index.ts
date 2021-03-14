import { Alg, LineComment, Newline } from "../../cubing/alg";
import { AlgBuilder } from "../../cubing/alg/AlgBuilder";
import "../../cubing/twisty"
import {Twisty3DCanvas, TwistyPlayer} from "../../cubing/twisty"
import {appearances3x3x3} from "../../cubing/twisty/3D/puzzles/stickerings"

const player: TwistyPlayer = document.querySelector("twisty-player")!;

function downloadDataURL(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}

function getScreenshot(alg: Alg, name?: string) {
  player.alg = alg;
  const twisty3DCanvas = player.viewerElems[0] as Twisty3DCanvas;
  downloadDataURL(twisty3DCanvas.renderToDataURL({squareCrop: true}), name ?? alg.toString());
}

const algsTextarea = document.querySelector("#algs")! as HTMLTextAreaElement;
algsTextarea.value = localStorage["multi-alg-text"] ?? "";
document.querySelector("#screenshot")!.addEventListener("click", () => {
  const algsText = algsTextarea.value;

  try {
    const algs = new Alg(algsText);
    algsTextarea.classList.add("saved");
    algsTextarea.classList.remove("error");
    localStorage["multi-alg-text"] = algsText;

    function downloadCurrentAlg(): void {
      if (currentAlgBuilder.experimentalNumUnits() > 0) {
        getScreenshot(currentAlgBuilder.toAlg());
        currentAlgBuilder.reset();
      }
    }

    const currentAlgBuilder = new AlgBuilder();
    for (const unit of algs.units()) {
      if (unit.is(LineComment)) {
        const comment = unit as LineComment;
        getScreenshot(currentAlgBuilder.toAlg(), comment.text.trim());
        currentAlgBuilder.reset();
      } else if (unit.is(Newline)) {
        downloadCurrentAlg();
      } else {
        currentAlgBuilder.push(unit);
      }
    }
    downloadCurrentAlg();
  } catch(e) {
    algsTextarea.classList.remove("saved");
    algsTextarea.classList.add("error");
  }
})

const stickeringSelect = document.querySelector("#stickering")! as HTMLSelectElement

for (const stickering of Object.keys(appearances3x3x3)) {
  const option = document.createElement("option");
  option.value = stickering;
  option.textContent = stickering;
  stickeringSelect.appendChild(option);
}

stickeringSelect.addEventListener("change", () => {
  const stickering = stickeringSelect.value
  player.experimentalStickering = stickering as any

  const url = new URL(location.href)
  url.searchParams.set("stickering", stickering)
  window.history.pushState(null, "", url.toString())
})

const originalURL = new URL(location.href)
const stickering = originalURL.searchParams.get("stickering");
if (stickering) {
  stickeringSelect.value = stickering;
  player.experimentalStickering = stickering as any;
}
