import { randomScrambleForEvent } from "../../../../cubing/search/outside";

const num = parseInt(new URL(location.href).searchParams.get("num") ?? "1000");

const elem = document.querySelector("#results") as HTMLDivElement;
const latest = document.querySelector("#latest") as HTMLSpanElement;
const numElem = document.querySelector("#num") as HTMLSpanElement;
const numCancelling = document.querySelector(
  "#num-cancelling",
) as HTMLSpanElement;
const mean = document.querySelector("#mean") as HTMLSpanElement;
const restMean = document.querySelector("#rest-mean") as HTMLSpanElement;
const median = document.querySelector("#median") as HTMLSpanElement;
(async () => {
  let first: number;
  let total = 0;
  let cancelling = 0;
  const results = [];
  for (let n = 1; n <= num; n++) {
    const start = performance.now();
    const scramble = await randomScrambleForEvent("222");
    const ms = Math.floor(10 * (performance.now() - start)) / 10;
    first ??= ms;
    latest.textContent = scramble.toString();

    numElem.textContent = `${n}`;
    numCancelling.textContent = `${cancelling}`;
    elem.textContent += `${ms}ms, `; // This is slow-ish, but we're not measuring it.
    total += ms;
    const unrepeated = scramble
      .toString()
      .replaceAll("2", "")
      .replaceAll("'", "");
    if (unrepeated.includes("L R") || unrepeated.includes("R L")) {
      cancelling++;
    }
    mean.textContent = `${Math.floor((total / n) * 10) / 10}ms`;
    if (n > 1) {
      restMean.textContent = `${
        Math.floor(((total - first) / (n - 1)) * 10) / 10
      }ms`;
    }

    results.push(ms);
    results.sort((a, b) => a - b);
    median.textContent = `${results[Math.floor(results.length / 2)]}ms`;
  }
})();
