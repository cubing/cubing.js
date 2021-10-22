import { Alg, LineComment, Newline } from "../../../../cubing/alg";
import { TwistyPlayer } from "../../../../cubing/twisty";
import {
  ExperimentalStickering,
  experimentalStickerings,
} from "../../../../cubing/twisty/old/dom/TwistyPlayerConfig";

const algsTextarea = document.querySelector("#algs") as HTMLTextAreaElement;
if (localStorage["multi-alg-textarea"]) {
  algsTextarea.value = localStorage["multi-alg-textarea"];
  algsTextarea.classList.add("saved");
}

algsTextarea.addEventListener("input", () => {
  algsTextarea.classList.remove("saved");
});

const player = new TwistyPlayer({});
document.querySelector("#display")!.appendChild(player);

async function downloadAlg(alg: Alg, name: string) {
  player.alg = alg;
  player.experimentalSetupAnchor = "end";
  player.timestamp = "opposite-anchor";

  await player.experimentalDownloadScreenshot(name);
}

const stickeringSelect = document.querySelector(
  "#stickering",
) as HTMLSelectElement;
for (const stickering of Object.keys(experimentalStickerings)) {
  const option: HTMLOptionElement = stickeringSelect.appendChild(
    document.createElement("option"),
  )!;
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

document.querySelector("#download")?.addEventListener("click", async () => {
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
    await downloadAlg(
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
