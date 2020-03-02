import { Sequence } from "../../src/alg";
import { Puzzles } from "../../src/kpuzzle";
import "../../src/twisty";
import { App } from "./app";
import { getURLParam } from "./url-params";

window.addEventListener("load", () => {
  if (!getURLParam("debug-js")) {
    return;
  }
  const appElement = document.querySelector("app")!;
  let alg: Sequence;
  try {
    alg = getURLParam("alg");
  } catch (e) {
    alg = new Sequence([]);
  }
  console.log(getURLParam("puzzle"));
  (window as any).app = new App(appElement, {
    puzzle: Puzzles[getURLParam("puzzle")],
    alg,
  });
});
