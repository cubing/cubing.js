import "../../../cubing/twisty/index.ts";
import { setTwistyDebug } from "../../../cubing/twisty/index.ts";
import {
  getConfigFromURL,
  remapLegacyURLParams,
} from "../../../cubing/twisty/views/twizzle/url-params.ts";
import { App } from "./app.ts";

function getRawBooleanURLParam(
  paramName: string,
  defaultValue: boolean,
): boolean {
  const value = new URLSearchParams(globalThis.location.search).get(paramName);
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

globalThis.addEventListener("DOMContentLoaded", () => {
  if (!getRawBooleanURLParam("debug-js", true)) {
    console.warn("Disabling JS based on URL param (for testing!)");
    return;
  }

  if (
    getRawBooleanURLParam("debug-show-render-stats", false) ||
    getRawBooleanURLParam("stats", false)
  ) {
    setTwistyDebug({ showRenderStats: true });
  }

  const appElement = document.querySelector("twizzle-app")!;
  (globalThis as any).app = new App(appElement, getConfigFromURL());
});
