import { Alg, LineComment, Newline } from "../../cubing/alg";
import { Twisty3DCanvas, TwistyPlayer } from "../../cubing/twisty";
import {
  experimentalStickerings,
  ExperimentalStickering,
} from "../../cubing/twisty/dom/TwistyPlayerConfig";

const algsTextarea = document.querySelector("#algs")! as HTMLTextAreaElement;
if (localStorage["multi-alg-textarea"]) {
  algsTextarea.value = localStorage["multi-alg-textarea"];
  algsTextarea.classList.add("saved");
}

algsTextarea.addEventListener("input", () => {
  algsTextarea.classList.remove("saved");
});

const player = new TwistyPlayer({});
document.querySelector("#display")!.appendChild(player);

function downloadURL(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.png`;
  a.click();
}

function downloadAlg(alg: Alg, name: string) {
  player.alg = alg;
  player.experimentalSetupAnchor = "end";

  const canvas = player.viewerElems[0] as Twisty3DCanvas;
  const dataURL = canvas.renderToDataURL({ squareCrop: true });
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
if (stickering) {
  if (stickering in experimentalStickerings) {
    player.experimentalStickering = stickering as ExperimentalStickering;
    stickeringSelect.value = stickering;
  } else {
    console.error("Invalid stickering:", stickering);
  }
}

stickeringSelect?.addEventListener("change", () => {
  const stickering = stickeringSelect.value as ExperimentalStickering;
  player.experimentalStickering = stickering;

  const url = new URL(location.href);
  url.searchParams.set("stickering", stickering);
  window.history.replaceState("", "", url.toString());
});

document.querySelector("#download")?.addEventListener("click", () => {
  const allAlgs = Alg.fromString(algsTextarea.value);

  let currentAlg = new Alg();
  const algList: {
    alg: Alg;
    name: string;
  }[] = [];
  for (const unit of allAlgs.units()) {
    if (unit.is(LineComment)) {
      algList.push({
        alg: currentAlg,
        name: (unit as LineComment).text.trim(),
      });
      currentAlg = new Alg();
    } else if (unit.is(Newline)) {
      // skip
    } else {
      currentAlg = currentAlg.concat([unit]);
    }
  }

  save();

  for (const { alg, name } of algList) {
    downloadAlg(
      new Alg(alg.experimentalExpand()),
      `${stickeringSelect.value} — ${name}`,
    );
  }
});

function save() {
  localStorage["multi-alg-textarea"] = algsTextarea.value;
  algsTextarea.classList.add("saved");
}

document.querySelector("#save")?.addEventListener("click", save);
