console.log("loading…");

import { Alg } from "../../../../../cubing/alg";
import { solutionAlg } from "../../stress-tests/40x40x40-solve.js";
import { default as init, internal_init, invert_alg } from "./cubing_rust_wasm";

(async () => {
  console.log("Initializating WASM");

  // Note: the initialization relies on proper handling of `new URL(…, import.meta.url)`, which `esbuild` does not properly support yet: https://github.com/evanw/esbuild/issues/795
  // However, we're lucky in that `esbuild` (currently) inlines the relevant code in the entry file for this folder, which allows the WASM import to work.
  // This could easily break at some point, if `esbuild` does not support `new URL(…, import.meta.url)` first.
  // If that happens, we can use an `esbuild`-specific workaround, at the expense of compatibility with other bundlers: https://github.com/evanw/esbuild/issues/312#issuecomment-1025066671
  await init();
  internal_init();

  console.log("Initialized!");
  console.log("Inverted alg test:", invert_alg("R U R'"));

  if (!globalThis.document) {
    console.info("Not running in a browser. Exiting!");
    process.exit(1);
  }

  const input = document.querySelector(".input") as HTMLInputElement;
  function register(elem: Element, f: (s: string) => string) {
    const output = elem.querySelector(".output")!;
    const durationElem = elem.querySelector(".duration")!;
    durationElem.textContent = "";
    input.addEventListener("input", () => {
      try {
        const start = performance.now();
        output.textContent = f(input.value);
        const duration = performance.now() - start;
        durationElem.textContent = ` (≈${Math.round(duration * 1_000)}µs)`;
        output.classList.remove("error");
      } catch (e) {
        output.textContent = (e as { toString(): string }).toString();
        output.classList.add("error");
      }
    });
  }

  register(document.querySelector("#rust")!, invert_alg);
  register(document.querySelector("#js")!, (s) => {
    return new Alg(s).invert().toString();
  });

  document.getElementById("use-wr")!.addEventListener("click", () => {
    input.value = `y x' // inspection
U R2 U' F' L F' U' L' // XX-Cross + EO
U' R U R' // 3rd slot
R' U R U2' R' U R // 4th slot
U R' U' R U' R' U2 R // OLL / ZBLL
U // AUF

// from http://cubesolv.es/solve/5757`;
    input.dispatchEvent(new CustomEvent("input"));
  });
  document
    .getElementById("use-40x40x40x40-solution")!
    .addEventListener("click", async () => {
      const alg = solutionAlg;
      input.value = alg.toString();
      input.dispatchEvent(new CustomEvent("input"));
    });
})();
