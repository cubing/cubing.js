import { setAlgDebug } from "../../../cubing/alg";
import "../../../cubing/twisty";
import { setTwistyDebug } from "../../../cubing/twisty";
import {
  getConfigFromURL,
  remapLegacyURLParams,
} from "../../../cubing/twisty/views/twizzle/url-params";
import { App } from "./app";

function getRawURLParam(paramName: string): string | null {
  return new URLSearchParams(window.location.search).get(paramName);
}

remapLegacyURLParams({
  "experimental-setup-alg": "setup-alg",
  "experimental-setup-anchor": "setup-anchor",
  "experimental-stickering": "stickering",
});

window.addEventListener("DOMContentLoaded", () => {
  if (!getRawURLParam("debug-js")) {
    return;
  }

  if (getRawURLParam("debug-show-render-stats")) {
    setTwistyDebug({ showRenderStats: true });
  }

  if (getRawURLParam("debug-carat-niss-notation")) {
    setAlgDebug({ caratNISSNotationEnabled: true });
  }

  const appElement = document.querySelector("app")!;
  (window as any).app = new App(appElement, getConfigFromURL());
});
