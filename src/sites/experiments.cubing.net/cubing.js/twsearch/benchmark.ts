import { randomScrambleForEvent } from "../../../../cubing/search/outside";

const elem = document.querySelector("#results") as HTMLDivElement;
const latest = document.querySelector("#latest") as HTMLSpanElement;
const mean = document.querySelector("#mean") as HTMLSpanElement;
(async () => {
  let total = 0;
  let cancelling = 0;
  for (let n = 1; n <= 1000; n++) {
    const start = performance.now();
    const scramble = await randomScrambleForEvent("222");
    const ms = Math.floor(performance.now() - start);
    latest.textContent = scramble.toString();
    elem.textContent += `${ms}ms, `; // This is slow-ish, but we're not measuring it.
    total += ms;
    const unrepeated = scramble
      .toString()
      .replaceAll("2", "")
      .replaceAll("'", "");
    if (unrepeated.includes("L R") || unrepeated.includes("R L")) {
      cancelling++;
    }
    mean.textContent = `${Math.floor(
      total / n,
    )}ms (${n} scrambles, ${cancelling} cancelling)`;
  }
})();
