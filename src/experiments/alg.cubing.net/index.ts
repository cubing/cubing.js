import "../../cubing/twisty";
import { App } from "./app";
import { getURLParam } from "./url-params";
import { useNewFaceNames } from "../../cubing/puzzle-geometry";
import { Alg } from "../../cubing/alg";

useNewFaceNames(true);

window.addEventListener("DOMContentLoaded", () => {
  if (!getURLParam("debug-js")) {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appElement = document.querySelector("app")!;
  let experimentalSetupAlg: Alg;
  try {
    experimentalSetupAlg = getURLParam("experimental-setup-alg");
  } catch (e) {
    experimentalSetupAlg = new Alg();
  }
  let alg: Alg;
  try {
    alg = getURLParam("alg");
  } catch (e) {
    alg = new Alg([]);
  }
  (window as any).app = new App(appElement, {
    puzzleName: getURLParam("puzzle"),
    experimentalSetupAlg,
    alg,
    experimentalSetupAnchor: getURLParam("experimental-setup-anchor"),
    experimentalStickering: getURLParam("experimental-stickering"),
  });
});
