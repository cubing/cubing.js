import { useNewFaceNames } from "../../../cubing/puzzle-geometry";
import "../../../cubing/twisty";
import { showStats } from "../../../cubing/twisty/views/3D/Twisty3DVantage";
import { getConfigFromURL, remapLegacyURLParams } from "../core/url-params";
import { App } from "./app";
import { getURLParam } from "./url-params";

remapLegacyURLParams({
  "experimental-setup-alg": "setup-alg",
  "experimental-setup-anchor": "setup-anchor",
  "experimental-stickering": "stickering",
});

useNewFaceNames(true);

window.addEventListener("DOMContentLoaded", () => {
  if (!getURLParam("debug-js")) {
    return;
  }

  if (getURLParam("debug-show-render-stats")) {
    showStats(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appElement = document.querySelector("app")!;
  (window as any).app = new App(appElement, getConfigFromURL());
});
