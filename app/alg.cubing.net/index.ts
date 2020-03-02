import { Sequence } from "../../src/alg";
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
  (window as any).app = new App(appElement, {
    puzzleName: getURLParam("puzzle"),
    alg,
  });
});
