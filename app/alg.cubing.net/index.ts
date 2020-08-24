import { Sequence } from "../../src/alg";
import "../../src/twisty";
import { App } from "./app";
import { getURLParam } from "./url-params";
import { useNewFaceNames } from "../../src/puzzle-geometry";

useNewFaceNames(true);

window.addEventListener("load", () => {
  if (!getURLParam("debug-js")) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
