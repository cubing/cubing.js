import { Sequence } from "../../cubing/alg";
import "../../cubing/twisty";
import { App } from "./app";
import { getURLParam } from "./url-params";
import { useNewFaceNames } from "../../cubing/puzzle-geometry";

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
