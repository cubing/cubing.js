import "../../../cubing/twisty";
import { experimentalDebugShowRenderStats } from "../../../cubing/twisty";
import {
  getConfigFromURL,
  remapLegacyURLParams,
} from "../../../cubing/twisty/views/twizzle/url-params";
import { App } from "./app";
import { getURLParam } from "./url-params";

remapLegacyURLParams({
  "experimental-setup-alg": "setup-alg",
  "experimental-setup-anchor": "setup-anchor",
  "experimental-stickering": "stickering",
});

window.addEventListener("DOMContentLoaded", () => {
  if (!getURLParam("debug-js")) {
    return;
  }

  if (getURLParam("debug-show-render-stats")) {
    experimentalDebugShowRenderStats(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appElement = document.querySelector("app")!;
  (window as any).app = new App(appElement, getConfigFromURL());
});
