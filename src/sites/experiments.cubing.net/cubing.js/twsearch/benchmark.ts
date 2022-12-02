import { randomScrambleForEvent } from "../../../../cubing/search/outside";

const elem = document.body.appendChild(document.createElement("div"));
(async () => {
  for (let i = 0; i < 1000; i++) {
    const start = performance.now();
    await randomScrambleForEvent("222");
    const ms = Math.floor(performance.now() - start);
    elem.textContent += `${ms}ms, `; // This is slow-ish, but we're not measuring it.
  }
})();
