import { randomScrambleForEvent } from "../../../../cubing/search/outside";

const elem = document.querySelector("#results") as HTMLDivElement;
const latest = document.querySelector("#latest") as HTMLSpanElement;
(async () => {
  for (let i = 0; i < 1000; i++) {
    const start = performance.now();
    const scramble = await randomScrambleForEvent("222");
    const ms = Math.floor(performance.now() - start);
    latest.textContent = scramble.toString();
    elem.textContent += `${ms}ms, `; // This is slow-ish, but we're not measuring it.
  }
})();
