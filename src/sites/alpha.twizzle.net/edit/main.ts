import { setAlgDebug } from "../../../cubing/alg";
import "../../../cubing/twisty";
import { setTwistyDebug } from "../../../cubing/twisty";
import {
  getConfigFromURL,
  remapLegacyURLParams,
} from "../../../cubing/twisty/views/twizzle/url-params";
import { App } from "./app";

function getRawBooleanURLParam(
  paramName: string,
  defaultValue: boolean,
): boolean {
  const value = new URLSearchParams(window.location.search).get(paramName);
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return defaultValue;
  }
}

remapLegacyURLParams({
  "experimental-setup-alg": "setup-alg",
  "experimental-setup-anchor": "setup-anchor",
  "experimental-stickering": "stickering",
});

window.addEventListener("DOMContentLoaded", () => {
  if (!getRawBooleanURLParam("debug-js", true)) {
    console.warn("Disabling JS based on URL param (for testing!)");
    return;
  }

  if (getRawBooleanURLParam("debug-show-render-stats", false)) {
    setTwistyDebug({ showRenderStats: true });
  }

  setAlgDebug({ caretNISSNotationEnabled: true });

  const appElement = document.querySelector("twizzle-app")!;
  (window as any).app = new App(appElement, getConfigFromURL());
});
