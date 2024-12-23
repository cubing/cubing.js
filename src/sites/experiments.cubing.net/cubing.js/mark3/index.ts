import { eventInfo, twizzleEvents } from "../../../../cubing/puzzles";
import { randomScrambleForEvent } from "../../../../cubing/scramble";
import { TwistyPlayer } from "../../../../cubing/twisty";

const currentEventID =
  new URL(location.href).searchParams.get("event") ?? "333";
const numScrambles = (() => {
  try {
    return Number.parseInt(
      new URL(location.href).searchParams.get("amount") ?? "5",
    );
  } catch {
    console.error("Could not parse amount, defaulting to 5");
    return 5;
  }
})();
const numExtraScrambles = (() => {
  try {
    return Number.parseInt(
      new URL(location.href).searchParams.get("extra-amount") ?? "2",
    );
  } catch {
    console.error("Could not parse extra amount, defaulting to 2");
    return 2;
  }
})();
const eventSelect = document.querySelector("select")!;

for (const [eventID, eventInfo] of Object.entries(twizzleEvents)) {
  const option = eventSelect.appendChild(document.createElement("option"));
  option.value = eventID;
  option.textContent = eventInfo.eventName;
  if (currentEventID === eventID) {
    option.selected = true;
  }
  eventSelect.addEventListener("change", () => {
    const url = new URL(location.href);
    url.searchParams.set("event", eventSelect.value);
    location.href = url.toString();
  });
}

const additionalInfoInput = document.querySelector("input") as HTMLInputElement;
additionalInfoInput.value =
  new URL(location.href).searchParams.get("additional-info") ?? "";
additionalInfoInput.addEventListener("input", () => {
  const url = new URL(location.href);
  url.searchParams.set("additional-info", additionalInfoInput.value);
  window.history.replaceState("", "", url.toString());
});

const table = document.querySelector("table")!;

async function addScramble(
  tbody: HTMLTableSectionElement,
  i: number,
  extra: boolean,
) {
  const tr = tbody.appendChild(document.createElement("tr"));
  tr.appendChild(document.createElement("td")).textContent = `${
    extra ? "E" : ""
  }${i}.`;
  const scrambleTD = tr.appendChild(document.createElement("td"));
  scrambleTD.textContent = "Generating…";
  const playerTD = tr.appendChild(document.createElement("td"));
  const player = new TwistyPlayer({
    puzzle: eventInfo(currentEventID)?.puzzleID,
    visualization: "2D",
    controlPanel: "none",
    background: "none",
  });
  player.classList.add("dim");
  playerTD.appendChild(player);
  const scramble = await randomScrambleForEvent(currentEventID);
  scrambleTD.textContent = "";
  const a = scrambleTD.appendChild(document.createElement("a"));
  a.textContent = scramble.toString();
  player.alg = scramble;
  player.classList.remove("dim");
  a.href = await player.experimentalModel.twizzleLink();
}

function addBody(num: number, extra: boolean) {
  const tbody = table.appendChild(document.createElement("tbody"));
  for (let i = 1; i <= num; i++) {
    addScramble(tbody, i, extra);
  }
}
if (numScrambles > 0) {
  addBody(numScrambles, false);
}
if (numExtraScrambles > 0) {
  addBody(numExtraScrambles, true);
}
