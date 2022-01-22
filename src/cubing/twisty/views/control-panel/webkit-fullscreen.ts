// Ponyfills for prefixing in Safari.

import { globalSafeDocument } from "../document";

declare global {
  interface Document {
    webkitFullscreenEnabled?: boolean;
    webkitExitFullscreen?: () => Promise<void>;
    webkitFullscreenElement?: Element | null;
  }

  interface Element {
    webkitRequestFullscreen: () => Promise<void>;
  }
}

// TODO: Can `webkitFullscreenEnabled` change after it's cached at page load?
export const fullscreenEnabled: boolean =
  globalSafeDocument?.fullscreenEnabled ||
  !!globalSafeDocument?.webkitFullscreenEnabled;

export function documentExitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else {
    return document.webkitExitFullscreen!(); // YOLO
  }
}

export function documentFullscreenElement(): Element | null {
  if (document.fullscreenElement) {
    return document.fullscreenElement;
  } else {
    return document.webkitFullscreenElement ?? null;
  }
}

export function requestFullscreen(element: Element): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else {
    return element.webkitRequestFullscreen();
  }
}
