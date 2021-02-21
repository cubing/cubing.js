import { Comment, expand, parseAlg, Sequence } from "../../cubing/alg";
import { Twisty3DCanvas, TwistyPlayer } from "../../cubing/twisty";
import {
  experimentalStickerings,
  ExperimentalStickering,
} from "../../cubing/twisty/dom/TwistyPlayerConfig";

const player = new TwistyPlayer({});
document.querySelector("#display")!.appendChild(player);

function downloadURL(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}

function downloadAlg(s: Sequence, name: string) {
  player.alg = s;
  player.experimentalSetupAnchor = "end";

  const canvas = player.viewerElems[0] as Twisty3DCanvas;
  const dataURL = canvas.renderToDataURL();
  downloadURL(dataURL, name);
}

const stickeringSelect = document.querySelector(
  "#stickering",
)! as HTMLSelectElement;
for (const stickering of Object.keys(experimentalStickerings)) {
  const option: HTMLOptionElement = stickeringSelect!.appendChild(
    document.createElement("option"),
  )! as HTMLOptionElement;
  option.value = stickering;
  option.textContent = stickering;
}
const stickering = new URL(location.href).searchParams.get("stickering");
if (stickering && stickering in experimentalStickerings) {
  player.experimentalStickering = stickering as ExperimentalStickering;
  stickeringSelect.value = stickering;
} else {
  console.error("Invalid stickering:", stickering);
}

stickeringSelect?.addEventListener("change", () => {
  const stickering = stickeringSelect.value as ExperimentalStickering;
  player.experimentalStickering = stickering;

  const url = new URL(location.href);
  url.searchParams.set("stickering", stickering);
  window.history.replaceState("", "", url.toString());
});

document.querySelector("#download")?.addEventListener("click", () => {
  const algsTextarea = document.querySelector("#algs")! as HTMLTextAreaElement;
  const allAlgs = parseAlg(algsTextarea.value);

  let currentAlg = new Sequence([]);
  const algList: {
    alg: Sequence;
    name: string;
  }[] = [];
  for (const unit of allAlgs.nestedUnits) {
    if (unit.type === "comment") {
      algList.push({
        alg: currentAlg,
        name: (unit as Comment).comment.trim(),
      });
      currentAlg = new Sequence([]);
    } else {
      currentAlg = new Sequence(currentAlg.nestedUnits.concat([unit]));
    }
  }

  for (const { alg, name } of algList) {
    downloadAlg(expand(alg), `${stickeringSelect.value} — ${name}`);
  }
});
