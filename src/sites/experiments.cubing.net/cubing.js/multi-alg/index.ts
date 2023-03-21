import { Alg, LineComment, Newline } from "../../../../cubing/alg";
import { puzzles } from "../../../../cubing/puzzles";
import { experimentalStickerings } from "../../../../cubing/puzzles/cubing-private";
import { type PuzzleID, TwistyPlayer } from "../../../../cubing/twisty";

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

const puzzleSelect = document.querySelector("#puzzle") as HTMLSelectElement;
for (const [puzzleID, puzzleManager] of Object.entries(puzzles)) {
  const option: HTMLOptionElement = puzzleSelect.appendChild(
    document.createElement("option"),
  )!;
  option.value = puzzleID;
  option.textContent = puzzleManager.fullName;
}
const puzzleID = new URL(location.href).searchParams.get("puzzle");
if (puzzleID) {
  if (puzzleID in puzzles) {
    player.puzzle = puzzleID as PuzzleID;
    puzzleSelect.value = puzzleID;
  } else {
    console.error("Invalid puzzle:", puzzleID);
  }
}

puzzleSelect.addEventListener("change", () => {
  const puzzleID = puzzleSelect.value;
  player.puzzle = puzzleID as PuzzleID;

  const url = new URL(location.href);
  url.searchParams.set("puzzle", puzzleID);
  window.history.replaceState("", "", url.toString());
});

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
    player.experimentalStickering = stickering;
    stickeringSelect.value = stickering;
  } else {
    console.error("Invalid stickering:", stickering);
  }
}

stickeringSelect?.addEventListener("change", () => {
  const stickering = stickeringSelect.value;
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
  for (const algNode of allAlgs.childAlgNodes()) {
    if (algNode.is(LineComment)) {
      algList.push({
        alg: currentAlg,
        name: (algNode as LineComment).text.trim(),
      });
      currentAlg = new Alg();
    } else if (algNode.is(Newline)) {
      // skip
    } else {
      currentAlg = currentAlg.concat([algNode]);
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
